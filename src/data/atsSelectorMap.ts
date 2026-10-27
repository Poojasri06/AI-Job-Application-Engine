export interface FieldSelectorRule {
  key: string;
  label: string;
  required: boolean;
  type: 'text' | 'file' | 'textarea' | 'select' | 'checkbox';
  patterns: {
    ids: string[];
    names: string[];
    placeholders: string[];
    labels: string[];
    ariaLabels: string[];
    autocomplete: string[];
  };
  greenhouseDefault: string;
  leverDefault: string;
}

export const ATS_SELECTOR_RULES: FieldSelectorRule[] = [
  {
    key: "first_name",
    label: "First Name",
    required: true,
    type: "text",
    patterns: {
      ids: ["first_name", "first-name", "firstname", "input-first_name", "candidate_first_name"],
      names: ["first_name", "first-name", "firstname", "candidate[first_name]", "name_first"],
      placeholders: ["First Name", "First name", "Given name", "First"],
      labels: ["First Name", "First name", "Given Name", "Legal First Name"],
      ariaLabels: ["First Name", "First name"],
      autocomplete: ["given-name", "fname"]
    },
    greenhouseDefault: "#first_name, input[name='first_name']",
    leverDefault: "input[name='name']" // Note: Lever frequently uses full name or separate
  },
  {
    key: "last_name",
    label: "Last Name",
    required: true,
    type: "text",
    patterns: {
      ids: ["last_name", "last-name", "lastname", "input-last_name", "candidate_last_name"],
      names: ["last_name", "last-name", "lastname", "candidate[last_name]", "name_last"],
      placeholders: ["Last Name", "Last name", "Family name", "Surname", "Last"],
      labels: ["Last Name", "Last name", "Family Name", "Legal Last Name"],
      ariaLabels: ["Last Name", "Last name"],
      autocomplete: ["family-name", "lname"]
    },
    greenhouseDefault: "#last_name, input[name='last_name']",
    leverDefault: "input[name='name']"
  },
  {
    key: "full_name",
    label: "Full Name (Lever standard)",
    required: true,
    type: "text",
    patterns: {
      ids: ["name", "full_name", "full-name", "candidate_name"],
      names: ["name", "full_name", "candidate[name]"],
      placeholders: ["Full Name", "Full name", "First and last name"],
      labels: ["Full Name", "Name", "Your name"],
      ariaLabels: ["Full Name", "Name"],
      autocomplete: ["name"]
    },
    greenhouseDefault: "#first_name", // Greenhouse splits
    leverDefault: "input[name='name']"
  },
  {
    key: "email",
    label: "Email Address",
    required: true,
    type: "text",
    patterns: {
      ids: ["email", "email_address", "candidate_email", "input-email"],
      names: ["email", "email_address", "candidate[email]"],
      placeholders: ["Email", "Email address", "you@example.com", "name@domain.com"],
      labels: ["Email", "Email Address", "Work Email", "Personal Email"],
      ariaLabels: ["Email", "Email Address"],
      autocomplete: ["email"]
    },
    greenhouseDefault: "#email, input[name='email']",
    leverDefault: "input[name='email']"
  },
  {
    key: "phone",
    label: "Phone Number",
    required: true,
    type: "text",
    patterns: {
      ids: ["phone", "phone_number", "telephone", "candidate_phone"],
      names: ["phone", "phone_number", "telephone", "candidate[phone]"],
      placeholders: ["Phone", "Phone number", "+1 (555) 000-0000", "Mobile phone"],
      labels: ["Phone", "Phone Number", "Mobile Phone", "Contact Number"],
      ariaLabels: ["Phone", "Phone Number"],
      autocomplete: ["tel", "mobile"]
    },
    greenhouseDefault: "#phone, input[name='phone']",
    leverDefault: "input[name='phone']"
  },
  {
    key: "resume_path",
    label: "Resume / CV Upload",
    required: true,
    type: "file",
    patterns: {
      ids: ["resume", "resume_file", "cv", "resume-upload", "upload-resume"],
      names: ["resume", "resume_file", "cv", "candidate[resume]"],
      placeholders: ["Upload resume", "Attach resume", "Select PDF"],
      labels: ["Resume/CV", "Attach Resume", "Upload Resume", "Resume"],
      ariaLabels: ["Upload resume", "Attach resume"],
      autocomplete: []
    },
    greenhouseDefault: "input[type='file'][name*='resume'], #resume_file, input[id*='resume']",
    leverDefault: "input[name='resume'], input[type='file']"
  },
  {
    key: "linkedin_url",
    label: "LinkedIn Profile URL",
    required: false,
    type: "text",
    patterns: {
      ids: ["linkedin", "linkedin_url", "job_application_answers_attributes_0_text_value"],
      names: ["linkedin", "linkedin_url", "urls[LinkedIn]", "candidate[linkedin_url]"],
      placeholders: ["LinkedIn", "https://linkedin.com/in/...", "LinkedIn Profile"],
      labels: ["LinkedIn", "LinkedIn URL", "LinkedIn Profile", "LinkedIn profile link"],
      ariaLabels: ["LinkedIn URL", "LinkedIn Profile"],
      autocomplete: []
    },
    greenhouseDefault: "input[autocomplete*='linkedin'], input[id*='linkedin'], input[name*='linkedin']",
    leverDefault: "input[name='urls[LinkedIn]']"
  },
  {
    key: "github_url",
    label: "GitHub Profile URL",
    required: false,
    type: "text",
    patterns: {
      ids: ["github", "github_url", "github-profile"],
      names: ["github", "github_url", "urls[GitHub]", "candidate[github_url]"],
      placeholders: ["GitHub", "https://github.com/...", "GitHub Profile"],
      labels: ["GitHub", "GitHub URL", "GitHub Profile", "Code Repository"],
      ariaLabels: ["GitHub Profile", "GitHub URL"],
      autocomplete: []
    },
    greenhouseDefault: "input[id*='github'], input[name*='github']",
    leverDefault: "input[name='urls[GitHub]']"
  },
  {
    key: "portfolio_url",
    label: "Portfolio / Website URL",
    required: false,
    type: "text",
    patterns: {
      ids: ["portfolio", "website", "portfolio_url", "personal-website"],
      names: ["portfolio", "website", "urls[Portfolio]", "urls[Other]", "candidate[website]"],
      placeholders: ["Portfolio", "Website", "Personal Website", "https://..."],
      labels: ["Portfolio", "Website", "Personal Site", "Personal Website URL"],
      ariaLabels: ["Portfolio URL", "Website URL"],
      autocomplete: ["url"]
    },
    greenhouseDefault: "input[id*='website'], input[name*='website']",
    leverDefault: "input[name='urls[Portfolio]']"
  },
  {
    key: "current_company",
    label: "Current Company / Org",
    required: false,
    type: "text",
    patterns: {
      ids: ["org", "company", "current_company", "employer"],
      names: ["org", "company", "candidate[company]", "current_company"],
      placeholders: ["Current company", "Company", "Employer"],
      labels: ["Current Company", "Company", "Current Employer"],
      ariaLabels: ["Current Company", "Company"],
      autocomplete: ["organization"]
    },
    greenhouseDefault: "input[id*='company'], input[name*='company']",
    leverDefault: "input[name='org']"
  }
];
