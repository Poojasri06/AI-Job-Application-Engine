export const PYTHON_ASYNC_SCRIPT = `#!/usr/bin/env python3
"""
Autonomous Job Application Engine: Browser Automation & Form-Filling Module
Author: Senior Automation Engineer
Target Platforms: Greenhouse.io, Lever.co, and generic ATS job boards
Runtime: Python 3.10+ | Playwright (Async API)

Features:
- Headful supervised execution
- Anti-bot mitigation (Blink flag masking, human typing cadence, bezier mouse trajectories)
- Heuristic Smart Selector Engine (id, name, placeholder, label association, aria-label)
- Local file input injection for PDF resumes
- Graceful fallback telemetry for unknown / custom ATS questions
- Human-in-the-Loop Verification Intercept prior to final submission
"""

from __future__ import annotations
import asyncio
import json
import logging
import math
import os
import random
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from playwright.async_api import (
    async_playwright,
    Browser,
    BrowserContext,
    ElementHandle,
    Locator,
    Page,
    TimeoutError as PlaywrightTimeoutError,
)

# -----------------------------------------------------------------------------
# LOGGING CONFIGURATION (High-visibility Colored Terminal Output)
# -----------------------------------------------------------------------------
class ColoredFormatter(logging.Formatter):
    GREY = "\\x1b[38;20m"
    BLUE = "\\x1b[34;20m"
    GREEN = "\\x1b[32;20m"
    YELLOW = "\\x1b[33;20m"
    RED = "\\x1b[31;20m"
    BOLD_RED = "\\x1b[31;1m"
    RESET = "\\x1b[0m"
    CYAN = "\\x1b[36;1m"

    FORMATS = {
        logging.DEBUG: GREY + "%(asctime)s [%(levelname)s] %(message)s" + RESET,
        logging.INFO: GREEN + "%(asctime)s [INFO] %(message)s" + RESET,
        logging.WARNING: YELLOW + "%(asctime)s [WARNING] %(message)s" + RESET,
        logging.ERROR: RED + "%(asctime)s [ERROR] %(message)s" + RESET,
        logging.CRITICAL: BOLD_RED + "%(asctime)s [CRITICAL] %(message)s" + RESET,
    }

    def format(self, record: logging.LogRecord) -> str:
        log_fmt = self.FORMATS.get(record.levelno, self.GREY + "%(asctime)s [%(levelname)s] %(message)s" + self.RESET)
        formatter = logging.Formatter(log_fmt, datefmt="%H:%M:%S")
        return formatter.format(record)

logger = logging.getLogger("AutoApplyEngine")
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(ColoredFormatter())
logger.handlers.clear()
logger.addHandler(handler)


# -----------------------------------------------------------------------------
# 1. PROFILE DATA INGESTION & DATA STRUCTURES
# -----------------------------------------------------------------------------
@dataclass
class CandidateProfile:
    first_name: str
    last_name: str
    email: str
    phone: str
    resume_path: str
    current_location: str = ""
    linkedin_url: str = ""
    github_url: str = ""
    portfolio_url: str = ""
    current_company: str = ""
    current_title: str = ""
    years_of_experience: int = 5
    salary_expectation: str = ""
    work_authorization: str = "Authorized to work in the US"
    requires_sponsorship: bool = False
    custom_answers: Dict[str, str] = field(default_factory=dict)

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()

    @classmethod
    def from_json(cls, file_path: str | Path) -> CandidateProfile:
        path = Path(file_path).resolve()
        if not path.is_file():
            raise FileNotFoundError(f"Profile config JSON not found at: {path}")

        logger.info(f"Ingesting profile data from: {path.name}")
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Validate mandatory core fields
        mandatory = ["first_name", "last_name", "email", "phone", "resume_path"]
        missing = [k for k in mandatory if not data.get(k)]
        if missing:
            raise ValueError(f"Profile is missing required fields: {', '.join(missing)}")

        # Validate resume path existence
        resume = Path(data["resume_path"]).expanduser().resolve()
        if not resume.is_file():
            logger.warning(
                f"Specified resume file was not found at '{resume}'. "
                "Ensure a valid PDF exists prior to execution."
            )

        return cls(
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            email=data.get("email", ""),
            phone=data.get("phone", ""),
            resume_path=str(resume),
            current_location=data.get("current_location", ""),
            linkedin_url=data.get("linkedin_url", ""),
            github_url=data.get("github_url", ""),
            portfolio_url=data.get("portfolio_url", ""),
            current_company=data.get("current_company", ""),
            current_title=data.get("current_title", ""),
            years_of_experience=data.get("years_of_experience", 5),
            salary_expectation=data.get("salary_expectation", ""),
            work_authorization=data.get("work_authorization", "Authorized to work"),
            requires_sponsorship=data.get("requires_sponsorship", False),
            custom_answers=data.get("custom_answers", {}),
        )


# -----------------------------------------------------------------------------
# 2. ANTI-BOT MITIGATION CONTROLLER
# -----------------------------------------------------------------------------
class AntiBotController:
    """
    Simulates human user behavior:
    - Bezier curve mouse paths with realistic micro-jitter
    - Variable typing intervals per keystroke (gaussian distribution)
    - Anti-detection browser flags and stealth context initialization
    """

    USER_AGENTS = [
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    ]

    @staticmethod
    def get_browser_args() -> List[str]:
        return [
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-infobars",
            "--start-maximized",
            "--window-size=1440,900",
            "--disable-dev-shm-usage",
        ]

    @staticmethod
    async def inject_stealth_scripts(page: Page) -> None:
        """Removes navigator.webdriver and masks automation fingerprints."""
        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            window.chrome = {
                runtime: {}
            };
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en']
            });
        """)

    @staticmethod
    def _cubic_bezier(t: float, p0: float, p1: float, p2: float, p3: float) -> float:
        return (
            (1 - t) ** 3 * p0
            + 3 * (1 - t) ** 2 * t * p1
            + 3 * (1 - t) * t ** 2 * p2
            + t ** 3 * p3
        )

    @classmethod
    async def move_mouse_humanlike(
        cls, page: Page, target_x: float, target_y: float, steps: int = 25
    ) -> None:
        """Generates a curved, natural mouse trajectory to target coordinates."""
        # Current mouse pos approximation or random viewport start
        start_x = random.uniform(100, 300)
        start_y = random.uniform(100, 300)

        # Control points for cubic bezier
        ctrl_x1 = start_x + (target_x - start_x) * random.uniform(0.1, 0.4) + random.uniform(-40, 40)
        ctrl_y1 = start_y + (target_y - start_y) * random.uniform(0.1, 0.4) + random.uniform(-40, 40)
        ctrl_x2 = start_x + (target_x - start_x) * random.uniform(0.6, 0.9) + random.uniform(-30, 30)
        ctrl_y2 = start_y + (target_y - start_y) * random.uniform(0.6, 0.9) + random.uniform(-30, 30)

        for i in range(steps + 1):
            t = i / steps
            x = cls._cubic_bezier(t, start_x, ctrl_x1, ctrl_x2, target_x)
            y = cls._cubic_bezier(t, start_y, ctrl_y1, ctrl_y2, target_y)
            # Add slight micro-tremor
            jitter_x = x + random.uniform(-0.8, 0.8)
            jitter_y = y + random.uniform(-0.8, 0.8)
            await page.mouse.move(jitter_x, jitter_y)
            await asyncio.sleep(random.uniform(0.005, 0.015))

    @staticmethod
    async def human_type(locator: Locator, text: str, clear_first: bool = True) -> None:
        """Types text character by character with organic timing variations."""
        await locator.scroll_into_view_if_needed(timeout=5000)
        await locator.click()
        await asyncio.sleep(random.uniform(0.1, 0.25))

        if clear_first:
            # Clear existing content safely
            await locator.fill("")
            await asyncio.sleep(random.uniform(0.05, 0.12))

        for char in text:
            await locator.type(char, delay=random.uniform(35, 110))
            # Occasional micro pause (like human thinking or spacing)
            if char in (" ", "@", ".", "-") and random.random() < 0.3:
                await asyncio.sleep(random.uniform(0.15, 0.35))

    @staticmethod
    async def natural_pause(min_seconds: float = 0.5, max_seconds: float = 1.6) -> None:
        """Brief pauses between filling different fields."""
        duration = random.uniform(min_seconds, max_seconds)
        await asyncio.sleep(duration)


# -----------------------------------------------------------------------------
# 3. SMART SELECTOR ENGINE
# -----------------------------------------------------------------------------
class SmartSelectorEngine:
    """
    Intelligent selector resolution engine with multi-attribute heuristic fallback:
    1. Direct attribute match (id, name, data-qa, autocomplete)
    2. Associated <label for="..."> text resolution
    3. Aria-label / Placeholder matching
    4. Substring and regex heuristics
    """

    # Field heuristic dictionaries
    RULES: Dict[str, Dict[str, List[str]]] = {
        "first_name": {
            "attributes": ["first_name", "first-name", "firstname", "candidate[first_name]", "name_first"],
            "labels": ["first name", "given name", "legal first name", "prénom"],
            "placeholders": ["first name", "given name", "first"],
        },
        "last_name": {
            "attributes": ["last_name", "last-name", "lastname", "candidate[last_name]", "name_last"],
            "labels": ["last name", "family name", "surname", "legal last name", "nom"],
            "placeholders": ["last name", "family name", "surname", "last"],
        },
        "full_name": {
            "attributes": ["name", "full_name", "full-name", "candidate[name]", "applicant_name"],
            "labels": ["full name", "your name", "name*"],
            "placeholders": ["full name", "first and last name", "john doe"],
        },
        "email": {
            "attributes": ["email", "email_address", "candidate[email]", "applicant_email"],
            "labels": ["email", "email address", "work email", "personal email"],
            "placeholders": ["email", "you@example.com", "name@domain.com"],
        },
        "phone": {
            "attributes": ["phone", "phone_number", "telephone", "candidate[phone]", "mobile_phone"],
            "labels": ["phone", "phone number", "mobile", "contact number"],
            "placeholders": ["phone", "+1", "(555)", "mobile phone"],
        },
        "resume": {
            "attributes": ["resume", "resume_file", "cv", "candidate[resume]", "resume-upload"],
            "labels": ["resume/cv", "attach resume", "upload resume", "cv", "resume"],
            "placeholders": ["upload resume", "attach resume", "choose file"],
        },
        "linkedin_url": {
            "attributes": ["linkedin", "linkedin_url", "urls[LinkedIn]", "candidate[linkedin_url]"],
            "labels": ["linkedin", "linkedin url", "linkedin profile"],
            "placeholders": ["linkedin", "https://linkedin.com/in/"],
        },
        "github_url": {
            "attributes": ["github", "github_url", "urls[GitHub]", "candidate[github_url]"],
            "labels": ["github", "github url", "github profile", "code repository"],
            "placeholders": ["github", "https://github.com/"],
        },
        "portfolio_url": {
            "attributes": ["portfolio", "website", "urls[Portfolio]", "urls[Other]", "candidate[website]"],
            "labels": ["portfolio", "website", "personal site", "portfolio url"],
            "placeholders": ["portfolio", "website", "https://"],
        },
        "current_company": {
            "attributes": ["org", "company", "current_company", "candidate[company]", "employer"],
            "labels": ["current company", "company", "current employer", "organization"],
            "placeholders": ["company", "employer", "current company"],
        },
        "current_location": {
            "attributes": ["location", "candidate_location", "city", "candidate[location]"],
            "labels": ["current location", "location", "city, state", "where are you based"],
            "placeholders": ["san francisco, ca", "city", "location"],
        },
    }

    @classmethod
    async def find_field_locator(cls, page: Page, field_key: str) -> Optional[Locator]:
        """
        Attempts multiple heuristic strategies to locate the form element.
        Returns the first matching Locator that is visible or present.
        """
        rule = cls.RULES.get(field_key)
        if not rule:
            logger.warning(f"No predefined heuristic rule for field: '{field_key}'")
            return None

        # Strategy 1: Direct ID or Name attribute exact & partial matches
        for attr_val in rule["attributes"]:
            css_candidates = [
                f"input[name='{attr_val}']",
                f"input[id='{attr_val}']",
                f"input[name*='{attr_val}']",
                f"input[id*='{attr_val}']",
                f"textarea[name='{attr_val}']",
                f"textarea[id='{attr_val}']",
            ]
            for selector in css_candidates:
                try:
                    locator = page.locator(selector).first
                    if await locator.count() > 0:
                        logger.debug(f"[{field_key}] Hit Strategy 1 (Attribute match: {selector})")
                        return locator
                except Exception:
                    continue

        # Strategy 2: Label association via 'has-text' and 'for' attribute
        for label_text in rule["labels"]:
            try:
                # Playwright built-in get_by_label
                label_loc = page.get_by_label(re.compile(label_text, re.IGNORECASE))
                if await label_loc.count() > 0:
                    logger.debug(f"[{field_key}] Hit Strategy 2 (get_by_label: '{label_text}')")
                    return label_loc.first
            except Exception:
                pass

            # Alternative: Search for label tag and check its 'for' target
            try:
                labels = page.locator(f"label:has-text('{label_text}')")
                if await labels.count() > 0:
                    for_id = await labels.first.get_attribute("for")
                    if for_id:
                        input_loc = page.locator(f"#{for_id}")
                        if await input_loc.count() > 0:
                            logger.debug(f"[{field_key}] Hit Strategy 2B (label[for]='#{for_id}')")
                            return input_loc
            except Exception:
                pass

        # Strategy 3: Placeholder / Aria-Label heuristics
        for ph in rule["placeholders"]:
            try:
                loc = page.get_by_placeholder(re.compile(ph, re.IGNORECASE))
                if await loc.count() > 0:
                    logger.debug(f"[{field_key}] Hit Strategy 3 (get_by_placeholder: '{ph}')")
                    return loc.first
            except Exception:
                pass

        # Strategy 4: Autocomplete attribute
        try:
            loc = page.locator(f"input[autocomplete*='{field_key}']")
            if await loc.count() > 0:
                logger.debug(f"[{field_key}] Hit Strategy 4 (autocomplete attribute)")
                return loc.first
        except Exception:
            pass

        return None

    @classmethod
    async def find_file_input(cls, page: Page) -> Optional[Locator]:
        """
        Specialized locator for resume file upload fields.
        Handles both direct inputs and drag-drop dropzones.
        """
        candidates = [
            "input[type='file'][name*='resume' i]",
            "input[type='file'][id*='resume' i]",
            "input[type='file'][data-qa*='resume' i]",
            "input[type='file'][name*='cv' i]",
            "input[type='file']",  # Fallback to the first file input on page
        ]
        for sel in candidates:
            try:
                loc = page.locator(sel).first
                if await loc.count() > 0:
                    logger.debug(f"[resume] File input found via selector: {sel}")
                    return loc
            except Exception:
                continue
        return None


# -----------------------------------------------------------------------------
# 4. ATS AUTOMATION ENGINE & FIELD INJECTION
# -----------------------------------------------------------------------------
class ATSAutomationEngine:
    """
    Main orchestration class handling page navigation, profile injection,
    file uploads, fallback handling, and verification pause.
    """

    def __init__(self, profile: CandidateProfile, headless: bool = False):
        self.profile = profile
        self.headless = headless
        self.unfilled_fields: List[str] = []
        self.filled_fields: List[str] = []

    async def run(self, application_url: str) -> None:
        """Executes the full automated application lifecycle."""
        logger.info(f"Initiating automation lifecycle for target: {application_url}")

        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=self.headless,
                args=AntiBotController.get_browser_args(),
            )

            context = await browser.new_context(
                user_agent=random.choice(AntiBotController.USER_AGENTS),
                viewport={"width": 1440, "height": 900},
                locale="en-US",
                timezone_id="America/Los_Angeles",
            )

            page = await context.new_page()
            await AntiBotController.inject_stealth_scripts(page)

            try:
                # 1. Navigation
                logger.info("Opening job application page...")
                await page.goto(application_url, wait_until="domcontentloaded", timeout=45000)
                await page.wait_for_timeout(2000)

                # Detect platform (Greenhouse / Lever / Generic)
                platform = self._detect_platform(page.url, await page.content())
                logger.info(f"Target ATS Platform identified as: [{platform.upper()}]")

                # 2. Inject Candidate Info
                await self._inject_candidate_details(page, platform)

                # 3. Handle Resume File Upload
                await self._inject_resume(page)

                # 4. Handle Custom Questions / Fallback Audit
                await self._handle_custom_questions(page)

                # 5. Fallback Audit & Reporting
                self._report_fallback_status()

                # 6. Verification Intercept (Human-in-the-Loop)
                await self._verification_intercept(page)

            except Exception as e:
                logger.error(f"Unexpected exception during automation flow: {e}", exc_info=True)
                # Keep browser open on error for inspection
                await self._verification_intercept(page, is_error=True)
            finally:
                logger.info("Closing browser context.")
                await context.close()
                await browser.close()

    def _detect_platform(self, url: str, content: str) -> str:
        if "greenhouse.io" in url or "gh_jid" in url or "greenhouse" in content.lower():
            return "greenhouse"
        elif "lever.co" in url or "lever" in content.lower():
            return "lever"
        elif "workday" in url or "myworkdayjobs" in url:
            return "workday"
        return "generic_ats"

    async def _inject_candidate_details(self, page: Page, platform: str) -> None:
        """Injects text fields using Smart Selector Engine."""
        logger.info("Scanning and populating standard applicant fields...")

        # Lever uses 'name' (full name) standard, whereas Greenhouse splits first/last
        if platform == "lever":
            fields_to_fill = [
                ("full_name", self.profile.full_name),
                ("email", self.profile.email),
                ("phone", self.profile.phone),
                ("current_company", self.profile.current_company),
                ("linkedin_url", self.profile.linkedin_url),
                ("github_url", self.profile.github_url),
                ("portfolio_url", self.profile.portfolio_url),
                ("current_location", self.profile.current_location),
            ]
        else:
            fields_to_fill = [
                ("first_name", self.profile.first_name),
                ("last_name", self.profile.last_name),
                ("email", self.profile.email),
                ("phone", self.profile.phone),
                ("current_company", self.profile.current_company),
                ("linkedin_url", self.profile.linkedin_url),
                ("github_url", self.profile.github_url),
                ("portfolio_url", self.profile.portfolio_url),
                ("current_location", self.profile.current_location),
            ]

        for field_key, value in fields_to_fill:
            if not value:
                continue

            locator = await SmartSelectorEngine.find_field_locator(page, field_key)

            if locator:
                try:
                    # Anti-bot simulated mouse movement towards element
                    box = await locator.bounding_box()
                    if box:
                        target_x = box["x"] + box["width"] / 2
                        target_y = box["y"] + box["height"] / 2
                        await AntiBotController.move_mouse_humanlike(page, target_x, target_y)

                    # Organic human typing
                    await AntiBotController.human_type(locator, str(value))
                    logger.info(f"  [OK] Injected '{field_key}' -> {value}")
                    self.filled_fields.append(field_key)
                    await AntiBotController.natural_pause(0.3, 0.8)
                except Exception as ex:
                    logger.warning(f"  [!] Failed to type into '{field_key}': {ex}")
                    self.unfilled_fields.append(field_key)
            else:
                logger.warning(f"  [FALLBACK] Field '{field_key}' could not be identified by selector engine.")
                self.unfilled_fields.append(field_key)

    async def _inject_resume(self, page: Page) -> None:
        """Injects resume PDF file into file input element."""
        resume_file = Path(self.profile.resume_path).expanduser().resolve()
        if not resume_file.is_file():
            logger.warning(f"[RESUME] File not found at '{resume_file}'. Skipping automated file upload.")
            self.unfilled_fields.append("resume_upload")
            return

        logger.info(f"Uploading candidate resume from: {resume_file.name}")
        file_input = await SmartSelectorEngine.find_file_input(page)

        if file_input:
            try:
                # Playwright's set_input_files works cleanly even on hidden inputs common in ATS styling
                await file_input.set_input_files(str(resume_file))
                logger.info(f"  [OK] Resume '{resume_file.name}' attached successfully.")
                self.filled_fields.append("resume_upload")
                await AntiBotController.natural_pause(0.8, 1.5)
            except Exception as e:
                logger.warning(f"  [FALLBACK] Resume upload failed: {e}")
                self.unfilled_fields.append("resume_upload")
        else:
            logger.warning("  [FALLBACK] No resume file input element detected.")
            self.unfilled_fields.append("resume_upload")

    async def _handle_custom_questions(self, page: Page) -> None:
        """Attempts to fill custom answers if specified in profile."""
        if not self.profile.custom_answers:
            return

        logger.info("Evaluating custom question heuristics...")
        for q_keyword, answer in self.profile.custom_answers.items():
            try:
                # Try locating inputs whose label or placeholder matches the custom question keyword
                regex_pattern = re.compile(q_keyword.replace("_", " "), re.IGNORECASE)
                loc = page.get_by_label(regex_pattern)
                if await loc.count() > 0:
                    tag_name = await loc.first.evaluate("el => el.tagName.toLowerCase()")
                    if tag_name in ("input", "textarea"):
                        await AntiBotController.human_type(loc.first, answer)
                        logger.info(f"  [OK] Custom question '{q_keyword}' filled.")
                        self.filled_fields.append(f"custom:{q_keyword}")
                    elif tag_name == "select":
                        await loc.first.select_option(label=answer)
                        logger.info(f"  [OK] Custom dropdown '{q_keyword}' selected.")
                        self.filled_fields.append(f"custom:{q_keyword}")
            except Exception:
                pass

    def _report_fallback_status(self) -> None:
        """Prints a scannable console report of automation status."""
        print("\\n" + "=" * 65)
        print("          AUTOMATION EXECUTION STATUS & AUDIT REPORT          ")
        print("=" * 65)
        print(f" Fields successfully injected ({len(self.filled_fields)}):")
        for f in self.filled_fields:
            print(f"   [x] {f}")

        if self.unfilled_fields:
            print(f"\\n [!] Attention Required - Fallback Fields ({len(self.unfilled_fields)}):")
            for f in self.unfilled_fields:
                print(f"   [ ] {f} (Please fill manually in browser)")
        else:
            print("\\n [OK] All standard fields resolved without fallback warnings.")
        print("=" * 65 + "\\n")

    async def _verification_intercept(self, page: Page, is_error: bool = False) -> None:
        """
        Verification Intercept:
        Pauses the script right before clicking the final 'Submit' button,
        keeping the browser open so the human engineer can verify everything
        and manually press submit when ready.
        """
        print("\\n" + "#" * 65)
        print("#             >>> VERIFICATION INTERCEPT ACTIVE <<<             #")
        print("#" * 65)
        print("# Form fields have been injected and resume PDF attached.       #")
        print("# The browser is in HEADFUL mode and awaiting your review.      #")
        print("#                                                               #")
        print("# 1. Inspect all fields and checkboxes on the application page. #")
        print("# 2. Complete any missing CAPTCHA or custom employer questions. #")
        print("# 3. Manually click the 'Submit Application' button in browser. #")
        print("#                                                               #")
        print("# When finished, return to this terminal and press [ENTER] to   #")
        print("# gracefully shut down the automation session.                  #")
        print("#" * 65 + "\\n")

        # Scroll down so the submit button is in view
        try:
            submit_btn = page.locator("button[type='submit'], input[type='submit'], button:has-text('Submit')").first
            if await submit_btn.count() > 0:
                await submit_btn.scroll_into_view_if_needed(timeout=3000)
        except Exception:
            pass

        # Interactive terminal pause (leaves the browser open and responsive)
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            input,
            "Press [ENTER] to exit after inspecting/submitting the application in the browser... "
        )


# -----------------------------------------------------------------------------
# 5. ENTRY POINT & CLI RUNNER
# -----------------------------------------------------------------------------
async def main() -> None:
    """CLI orchestrator for the automation engine."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Autonomous ATS Job Application Browser Automation Engine"
    )
    parser.add_argument(
        "--url",
        type=str,
        default="https://boards.greenhouse.io/stripe/jobs/4251234",
        help="Target job application page URL (Greenhouse, Lever, etc.)",
    )
    parser.add_argument(
        "--profile",
        type=str,
        default="profile.json",
        help="Path to candidate profile configuration JSON",
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        help="Run in headless mode (default is headful for supervised verification)",
    )

    args = parser.parse_args()

    # Load candidate profile
    profile_path = Path(args.profile)
    if not profile_path.exists():
        # Fallback to demo profile generation if none found
        logger.warning(f"Profile file '{args.profile}' not found. Creating a template profile.json...")
        demo_data = {
            "first_name": "Alex",
            "last_name": "Chen",
            "email": "alex.chen.dev@gmail.com",
            "phone": "+1 (415) 555-0192",
            "resume_path": "./resume.pdf",
            "current_location": "San Francisco, CA",
            "linkedin_url": "https://linkedin.com/in/alexchen-eng",
            "github_url": "https://github.com/alexchen-dev",
            "portfolio_url": "https://alexchen.dev",
            "current_company": "Stripe",
            "current_title": "Senior Automation Engineer",
            "salary_expectation": "$190,000",
            "custom_answers": {
                "how_did_you_hear": "LinkedIn Job Board",
                "veteran": "I am not a protected veteran"
            }
        }
        with open("profile.json", "w", encoding="utf-8") as f:
            json.dump(demo_data, f, indent=2)

    profile = CandidateProfile.from_json(args.profile)

    # Initialize and execute engine
    engine = ATSAutomationEngine(profile=profile, headless=args.headless)
    await engine.run(application_url=args.url)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\\n[!] Automation session terminated by user.")
`;

export const PYTHON_SYNC_SCRIPT = `#!/usr/bin/env python3
"""
Autonomous Job Application Engine: Synchronous Playwright Version
For engineers who prefer a straightforward, linear execution style.
"""

import json
import logging
import random
import re
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("ATSApplierSync")

def run_sync_applier(job_url: str, profile_path: str = "profile.json"):
    # 1. Ingest profile data
    path = Path(profile_path)
    if not path.is_file():
        raise FileNotFoundError(f"Missing {profile_path}")
    
    with open(path, "r", encoding="utf-8") as f:
        profile = json.load(f)

    logger.info(f"Loaded profile for: {profile.get('first_name')} {profile.get('last_name')}")

    with sync_playwright() as p:
        # Launch headful browser
        browser = p.chromium.launch(
            headless=False,
            args=["--disable-blink-features=AutomationControlled", "--start-maximized"]
        )
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        # Stealth mask
        page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

        logger.info(f"Navigating to {job_url}...")
        page.goto(job_url, wait_until="domcontentloaded")
        time.sleep(2)

        # Smart selector dictionary
        field_mappings = [
            ("first_name", ["#first_name", "input[name='first_name']", "input[name*='first']"], profile.get("first_name")),
            ("last_name", ["#last_name", "input[name='last_name']", "input[name*='last']"], profile.get("last_name")),
            ("full_name", ["input[name='name']", "#name", "input[placeholder*='Full Name']"], f"{profile.get('first_name')} {profile.get('last_name')}"),
            ("email", ["#email", "input[name='email']", "input[type='email']"], profile.get("email")),
            ("phone", ["#phone", "input[name='phone']", "input[type='tel']"], profile.get("phone")),
            ("linkedin", ["input[name*='linkedin']", "input[id*='linkedin']", "input[name='urls[LinkedIn]']"], profile.get("linkedin_url")),
            ("github", ["input[name*='github']", "input[id*='github']", "input[name='urls[GitHub]']"], profile.get("github_url")),
            ("portfolio", ["input[name*='website']", "input[name*='portfolio']", "input[name='urls[Portfolio]']"], profile.get("portfolio_url")),
            ("company", ["input[name*='company']", "input[name='org']", "#org"], profile.get("current_company")),
        ]

        # Inject text fields with human delay
        for name, selectors, val in field_mappings:
            if not val:
                continue
            matched = False
            for sel in selectors:
                loc = page.locator(sel).first
                if loc.count() > 0:
                    loc.scroll_into_view_if_needed()
                    loc.fill("")
                    for char in str(val):
                        loc.type(char, delay=random.uniform(30, 80))
                    logger.info(f"[OK] Injected '{name}' via {sel}")
                    matched = True
                    time.sleep(random.uniform(0.3, 0.7))
                    break
            if not matched:
                logger.warning(f"[FALLBACK] Could not locate input for '{name}'. Please fill manually.")

        # File upload handler
        resume_path = Path(profile.get("resume_path", "./resume.pdf")).resolve()
        if resume_path.is_file():
            file_loc = page.locator("input[type='file']").first
            if file_loc.count() > 0:
                file_loc.set_input_files(str(resume_path))
                logger.info(f"[OK] Attached resume file: {resume_path.name}")
            else:
                logger.warning("[FALLBACK] File upload input not found.")
        else:
            logger.warning(f"[FALLBACK] Resume file '{resume_path}' does not exist.")

        # Verification Intercept
        print("\\n" + "=" * 60)
        print(">>> VERIFICATION INTERCEPT: Review fields in browser <<<")
        print(">>> Script paused. Manually submit in browser when ready. <<<")
        print("=" * 60)
        input("Press [ENTER] in this terminal when finished to close browser... ")

        context.close()
        browser.close()

if __name__ == "__main__":
    run_sync_applier("https://boards.greenhouse.io/stripe/jobs/4251234")
`;

export const PROFILE_JSON = `{
  "first_name": "Alex",
  "last_name": "Chen",
  "email": "alex.chen.dev@gmail.com",
  "phone": "+1 (415) 555-0192",
  "current_location": "San Francisco, CA",
  "resume_path": "./resume.pdf",
  "linkedin_url": "https://linkedin.com/in/alexchen-eng",
  "github_url": "https://github.com/alexchen-dev",
  "portfolio_url": "https://alexchen.dev",
  "current_company": "Stripe",
  "current_title": "Senior Automation Engineer",
  "years_of_experience": 6,
  "salary_expectation": "$185,000 - $210,000",
  "work_authorization": "Authorized to work in the US without sponsorship",
  "requires_sponsorship": false,
  "start_date": "2 weeks notice",
  "custom_answers": {
    "how_did_you_hear": "LinkedIn Job Board",
    "why_join_us": "Passionate about building scalable distributed automation infrastructure.",
    "gender": "Decline to self-identify",
    "veteran": "I am not a protected veteran",
    "disability": "I do not have a disability"
  }
}`;

export const REQUIREMENTS_TXT = `playwright>=1.49.1
playwright-stealth>=1.0.6
`;

export const CODEGEN_GUIDE_MD = `# Playwright Codegen Mastery Guide for ATS Job Applications

## 1. Quickstart Commands

Launch Playwright Codegen targeting any ATS URL:

\`\`\`bash
# Basic headful codegen session
playwright codegen https://boards.greenhouse.io/<company>/jobs/<id>

# Codegen with realistic desktop viewport and modern user agent
playwright codegen \\
  --viewport-size=1440,900 \\
  --user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36" \\
  https://jobs.lever.co/<company>/<id>/apply

# Save output directly to python file
playwright codegen -o recorded_apply.py https://jobs.lever.co/<company>/<id>/apply
\`\`\`

---

## 2. Senior Engineer Techniques for Tricky ATS Elements

### A. Hidden File Inputs (Resume Dropzones)
Most modern ATS platforms (Greenhouse, Lever, Ashby) hide the native \`<input type="file">\` behind stylized drag-and-drop boxes (\`display: none\` or \`opacity: 0\`).
- **Never click the visual dropzone button!** That opens the OS-native file dialog which freezes Playwright.
- **Always target the underlying input directly with \`set_input_files\`**:
  \`\`\`python
  # Direct injection works even when input is hidden
  page.locator("input[type='file'][name*='resume']").set_input_files("./resume.pdf")
  \`\`\`

### B. Nested Iframes (Greenhouse Embedded Widgets)
When a company embeds Greenhouse into their custom career portal (e.g. \`careers.company.com/apply\`), the form is often inside an \`<iframe>\`:
\`\`\`python
# Locate the greenhouse iframe first
gh_frame = page.frame_locator("#grnhse_iframe, iframe[title='Job Application']")

# Fill elements inside the iframe
await gh_frame.locator("#first_name").fill("Alex")
await gh_frame.locator("#email").fill("alex@example.com")
\`\`\`

### C. Searchable Dropdowns (Select2 / React-Select)
ATS forms often use custom comboboxes rather than native \`<select>\` elements.
\`\`\`python
# Click the container to open the search box
await page.locator(".select2-choice, [id*='location-select']").click()
# Type the search term
await page.keyboard.type("San Francisco", delay=50)
await page.keyboard.press("Enter")
\`\`\`

### D. Bypassing Bot Detection (Cloudflare Turnstile / DataDome)
If an ATS triggers a Turnstile checkbox:
1. Use \`args=["--disable-blink-features=AutomationControlled"]\`.
2. Do not use generic \`headless=True\`. Use new headless mode (\`headless=new\` or \`headless=False\` for supervised runs).
3. Always randomize keystroke delays (\`random.uniform(0.04, 0.12)\`) and mouse movements using bezier paths.
`;
