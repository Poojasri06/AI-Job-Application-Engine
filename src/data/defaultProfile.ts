export interface UserProfile {
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  current_location: string;
  resume_path: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  twitter_url: string;
  current_company: string;
  current_title: string;
  years_of_experience: number;
  salary_expectation: string;
  work_authorization: string;
  requires_sponsorship: boolean;
  start_date: string;
  custom_answers: Record<string, string>;
}

export const defaultProfile: UserProfile = {
  first_name: "Alex",
  last_name: "Chen",
  full_name: "Alex Chen",
  email: "alex.chen.dev@gmail.com",
  phone: "+1 (415) 555-0192",
  current_location: "San Francisco, CA",
  resume_path: "./resume.pdf",
  linkedin_url: "https://linkedin.com/in/alexchen-eng",
  github_url: "https://github.com/alexchen-dev",
  portfolio_url: "https://alexchen.dev",
  twitter_url: "https://x.com/alexchen_tech",
  current_company: "Stripe",
  current_title: "Senior Full-Stack Automation Engineer",
  years_of_experience: 6,
  salary_expectation: "$185,000 - $210,000",
  work_authorization: "Authorized to work in the US without sponsorship",
  requires_sponsorship: false,
  start_date: "2 weeks notice",
  custom_answers: {
    "how_did_you_hear": "LinkedIn Job Board",
    "why_join_us": "Excited by your distributed systems architecture and mission to scale high-throughput infrastructure.",
    "gender": "Decline to self-identify",
    "race": "Decline to self-identify",
    "veteran": "I am not a protected veteran",
    "disability": "I do not have a disability"
  }
};
