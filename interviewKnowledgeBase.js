const interviewKnowledgeBase = {
  metadata: {
    title: "AI Interviewer Knowledge Base",
    version: "1.0",
    totalCategories: 10,
    totalQuestions: 120,
    difficultyLevels: ["easy", "medium", "hard"],
    lastUpdated: "2026-04-23"
  },

  categories: [
    {
      id: "general",
      label: "General / HR Interview",
      color: "#534AB7",
      description: "Used in screening and early-stage HR rounds to assess background, motivations, career trajectory, and cultural alignment.",
      subcategories: [
        {
          name: "Introduction & Background",
          questions: [
            { id: "gen-001", question: "Tell me about yourself.", difficulty: "easy", keyQuestion: true },
            { id: "gen-002", question: "Walk me through your resume.", difficulty: "easy", keyQuestion: false },
            { id: "gen-003", question: "What is your greatest professional achievement so far?", difficulty: "medium", keyQuestion: false },
            { id: "gen-004", question: "What are your top three strengths and one real weakness?", difficulty: "medium", keyQuestion: true },
            { id: "gen-005", question: "Why did you leave your last job (or why are you looking to leave)?", difficulty: "easy", keyQuestion: false },
            { id: "gen-006", question: "Where do you see yourself in five years?", difficulty: "easy", keyQuestion: false }
          ]
        },
        {
          name: "Motivation & Fit",
          questions: [
            { id: "gen-007", question: "Why do you want to work here specifically?", difficulty: "medium", keyQuestion: true },
            { id: "gen-008", question: "What do you know about our company and what excites you most?", difficulty: "medium", keyQuestion: false },
            { id: "gen-009", question: "Why should we hire you over other candidates?", difficulty: "medium", keyQuestion: false },
            { id: "gen-010", question: "Describe your ideal work environment.", difficulty: "easy", keyQuestion: false },
            { id: "gen-011", question: "What does success look like to you in the first 90 days?", difficulty: "medium", keyQuestion: false }
          ]
        },
        {
          name: "Compensation & Logistics",
          questions: [
            { id: "gen-012", question: "What are your salary expectations?", difficulty: "easy", keyQuestion: false },
            { id: "gen-013", question: "Are you comfortable with the required travel or remote work setup?", difficulty: "easy", keyQuestion: false },
            { id: "gen-014", question: "Do you have any questions for us?", difficulty: "easy", keyQuestion: false },
            { id: "gen-015", question: "What is your notice period at your current employer?", difficulty: "easy", keyQuestion: false }
          ]
        }
      ]
    },

    {
      id: "behavioral",
      label: "Behavioral Interview",
      color: "#0F6E56",
      description: "Past behavior predicts future performance. Uses the STAR method (Situation, Task, Action, Result). Predictive validity: ~55%.",
      subcategories: [
        {
          name: "Teamwork & Collaboration",
          questions: [
            { id: "beh-001", question: "Tell me about a time you worked on a highly cross-functional team. What was your role?", difficulty: "medium", keyQuestion: true },
            { id: "beh-002", question: "Describe a situation where you had to work with someone whose style was very different from yours.", difficulty: "medium", keyQuestion: false },
            { id: "beh-003", question: "Tell me about a time you helped a struggling team member without being asked.", difficulty: "medium", keyQuestion: false },
            { id: "beh-004", question: "Give an example of when team consensus was wrong and how you handled it.", difficulty: "hard", keyQuestion: false }
          ]
        },
        {
          name: "Conflict & Communication",
          questions: [
            { id: "beh-005", question: "Tell me about a time you had a significant disagreement with a coworker. How did you resolve it?", difficulty: "medium", keyQuestion: true },
            { id: "beh-006", question: "Describe a time you had to deliver difficult feedback to a colleague or manager.", difficulty: "hard", keyQuestion: false },
            { id: "beh-007", question: "Tell me about a time you had to influence someone without formal authority.", difficulty: "hard", keyQuestion: false },
            { id: "beh-008", question: "Describe a time you disagreed with a decision made by leadership. What did you do?", difficulty: "hard", keyQuestion: false }
          ]
        },
        {
          name: "Failure & Growth",
          questions: [
            { id: "beh-009", question: "Tell me about a significant professional mistake you made. What did you learn?", difficulty: "medium", keyQuestion: true },
            { id: "beh-010", question: "Describe a time you failed to meet a deadline. How did you handle the fallout?", difficulty: "medium", keyQuestion: false },
            { id: "beh-011", question: "Tell me about a time you received critical feedback. How did you respond?", difficulty: "easy", keyQuestion: false }
          ]
        },
        {
          name: "Leadership & Initiative",
          questions: [
            { id: "beh-012", question: "Tell me about a time you took ownership of a problem that wasn't technically yours.", difficulty: "medium", keyQuestion: false },
            { id: "beh-013", question: "Describe a time you led a team through a high-pressure or uncertain situation.", difficulty: "hard", keyQuestion: true },
            { id: "beh-014", question: "Give an example of a time you identified an opportunity for improvement and drove it forward.", difficulty: "hard", keyQuestion: false }
          ]
        }
      ]
    },

    {
      id: "situational",
      label: "Situational Interview",
      color: "#993C1D",
      description: "Hypothetical scenarios testing judgment, prioritization, and decision-making in the moment. Assesses what you would do.",
      subcategories: [
        {
          name: "Priority & Time Management",
          questions: [
            { id: "sit-001", question: "You have three high-priority tasks all due at the same time. What do you do?", difficulty: "medium", keyQuestion: true },
            { id: "sit-002", question: "Halfway through a major project, a more urgent priority lands on your desk. How do you respond?", difficulty: "hard", keyQuestion: false },
            { id: "sit-003", question: "You discover a critical error on a deliverable that's already been sent to the client. What's your next step?", difficulty: "hard", keyQuestion: false }
          ]
        },
        {
          name: "Interpersonal Scenarios",
          questions: [
            { id: "sit-004", question: "A colleague is consistently missing deadlines and it's affecting your work. What do you do?", difficulty: "medium", keyQuestion: false },
            { id: "sit-005", question: "You notice a team member is burned out but hasn't said anything. How do you approach them?", difficulty: "medium", keyQuestion: false },
            { id: "sit-006", question: "Your manager asks you to do something you believe is unethical. What do you do?", difficulty: "hard", keyQuestion: true },
            { id: "sit-007", question: "A new team member is underperforming in their first month. How would you handle it?", difficulty: "medium", keyQuestion: false }
          ]
        },
        {
          name: "Decision Making",
          questions: [
            { id: "sit-008", question: "You have to make an important decision but don't have all the information. What do you do?", difficulty: "hard", keyQuestion: true },
            { id: "sit-009", question: "Two stakeholders give you completely conflicting instructions. How do you proceed?", difficulty: "hard", keyQuestion: false },
            { id: "sit-010", question: "You are asked to present a plan you personally disagree with. How do you handle it?", difficulty: "hard", keyQuestion: false }
          ]
        }
      ]
    },

    {
      id: "technical",
      label: "Technical Interview",
      color: "#185FA5",
      description: "Assesses hard skills, domain knowledge, coding ability, and problem-solving. Common in engineering, data, finance, and IT roles.",
      subcategories: [
        {
          name: "Coding & Algorithms",
          questions: [
            { id: "tec-001", question: "Explain the difference between an array and a linked list. When would you use each?", difficulty: "easy", keyQuestion: false },
            { id: "tec-002", question: "What is the time complexity of binary search and why?", difficulty: "easy", keyQuestion: false },
            { id: "tec-003", question: "Implement a function to detect a cycle in a linked list.", difficulty: "medium", keyQuestion: true },
            { id: "tec-004", question: "Given a string, write a function to find all permutations.", difficulty: "hard", keyQuestion: false },
            { id: "tec-005", question: "Explain dynamic programming and solve the 0/1 knapsack problem.", difficulty: "hard", keyQuestion: false }
          ]
        },
        {
          name: "Data Structures",
          questions: [
            { id: "tec-006", question: "When would you use a hash map over a sorted array?", difficulty: "medium", keyQuestion: false },
            { id: "tec-007", question: "Explain how a heap works and name two real-world use cases.", difficulty: "medium", keyQuestion: false },
            { id: "tec-008", question: "What is a trie and when is it more efficient than a hash map?", difficulty: "hard", keyQuestion: false }
          ]
        },
        {
          name: "Domain Knowledge",
          questions: [
            { id: "tec-009", question: "What is the difference between SQL and NoSQL databases? When do you choose one over the other?", difficulty: "medium", keyQuestion: true },
            { id: "tec-010", question: "Explain REST vs GraphQL — what are the tradeoffs?", difficulty: "medium", keyQuestion: false },
            { id: "tec-011", question: "What happens from the moment you type a URL to when the page renders?", difficulty: "hard", keyQuestion: false },
            { id: "tec-012", question: "Explain ACID properties in databases with examples.", difficulty: "medium", keyQuestion: false }
          ]
        },
        {
          name: "Debugging & Code Quality",
          questions: [
            { id: "tec-013", question: "Describe a challenging technical bug you diagnosed. Walk me through your process.", difficulty: "medium", keyQuestion: true },
            { id: "tec-014", question: "How do you approach writing unit tests for complex business logic?", difficulty: "medium", keyQuestion: false },
            { id: "tec-015", question: "How do you use AI coding tools, and how do you verify AI-generated code?", difficulty: "easy", keyQuestion: false }
          ]
        }
      ]
    },

    {
      id: "systemDesign",
      label: "System Design Interview",
      color: "#534AB7",
      description: "Evaluates architectural maturity, scalability thinking, and trade-off reasoning. Critical for mid-senior engineering roles.",
      subcategories: [
        {
          name: "Clarification & Scoping",
          questions: [
            { id: "sys-001", question: "Before designing, what clarifying questions do you always ask?", difficulty: "medium", keyQuestion: true },
            { id: "sys-002", question: "How do you distinguish functional requirements from non-functional requirements?", difficulty: "medium", keyQuestion: false },
            { id: "sys-003", question: "How do you estimate scale — users, requests per second, storage needs?", difficulty: "hard", keyQuestion: false }
          ]
        },
        {
          name: "Core Design Problems",
          questions: [
            { id: "sys-004", question: "Design a URL shortener like bit.ly.", difficulty: "medium", keyQuestion: true },
            { id: "sys-005", question: "Design Twitter's news feed system.", difficulty: "hard", keyQuestion: false },
            { id: "sys-006", question: "Design a distributed rate limiter.", difficulty: "hard", keyQuestion: false },
            { id: "sys-007", question: "Design a notification system that handles 10 million users.", difficulty: "hard", keyQuestion: false },
            { id: "sys-008", question: "Design a key-value store like Redis.", difficulty: "hard", keyQuestion: false }
          ]
        },
        {
          name: "Trade-offs & Principles",
          questions: [
            { id: "sys-009", question: "Explain CAP theorem. In what scenarios do you sacrifice consistency for availability?", difficulty: "hard", keyQuestion: true },
            { id: "sys-010", question: "What's the difference between horizontal and vertical scaling?", difficulty: "easy", keyQuestion: false },
            { id: "sys-011", question: "When would you use a message queue vs a direct API call?", difficulty: "medium", keyQuestion: false },
            { id: "sys-012", question: "How do you design for failure? Walk me through your approach.", difficulty: "hard", keyQuestion: false }
          ]
        }
      ]
    },

    {
      id: "case",
      label: "Case / Problem-Solving Interview",
      color: "#993C1D",
      description: "Common in consulting, finance, and product roles. Tests structured thinking, business acumen, and quantitative reasoning on the spot.",
      subcategories: [
        {
          name: "Business Cases",
          questions: [
            { id: "cas-001", question: "Revenue for our client has dropped 20% year-over-year. How would you diagnose this?", difficulty: "hard", keyQuestion: true },
            { id: "cas-002", question: "A consumer goods company wants to enter a new international market. How would you advise them?", difficulty: "hard", keyQuestion: false },
            { id: "cas-003", question: "Our client wants to cut costs by 15%. Where would you start?", difficulty: "hard", keyQuestion: false },
            { id: "cas-004", question: "A startup wants to increase user retention. What framework would you use to approach this?", difficulty: "medium", keyQuestion: true }
          ]
        },
        {
          name: "Market Sizing & Estimation",
          questions: [
            { id: "cas-005", question: "How many cups of coffee are consumed in Lahore every day?", difficulty: "medium", keyQuestion: false },
            { id: "cas-006", question: "Estimate the market size for electric scooters in Pakistan.", difficulty: "hard", keyQuestion: false },
            { id: "cas-007", question: "How many Uber trips are taken globally per day?", difficulty: "medium", keyQuestion: false }
          ]
        },
        {
          name: "Product & Strategy",
          questions: [
            { id: "cas-008", question: "How would you improve our product for a specific user segment?", difficulty: "medium", keyQuestion: false },
            { id: "cas-009", question: "You have $1M to invest in one of three growth strategies. How do you decide?", difficulty: "hard", keyQuestion: false },
            { id: "cas-010", question: "A competitor just launched a feature that threatens our core product. What do we do?", difficulty: "hard", keyQuestion: false }
          ]
        }
      ]
    },

    {
      id: "leadership",
      label: "Leadership Interview",
      color: "#0C447C",
      description: "For management and senior roles. Assesses vision, people development, strategic alignment, and how you lead under pressure.",
      subcategories: [
        {
          name: "Team Development",
          questions: [
            { id: "lea-001", question: "How do you identify and develop high-potential talent on your team?", difficulty: "medium", keyQuestion: true },
            { id: "lea-002", question: "Describe your approach to performance management, including managing underperformers.", difficulty: "hard", keyQuestion: false },
            { id: "lea-003", question: "How do you build psychological safety within a team?", difficulty: "medium", keyQuestion: false },
            { id: "lea-004", question: "Tell me about a time you had to let someone go. How did you handle it?", difficulty: "hard", keyQuestion: false }
          ]
        },
        {
          name: "Strategic Thinking",
          questions: [
            { id: "lea-005", question: "How do you align a team's work to the company's long-term strategy?", difficulty: "hard", keyQuestion: true },
            { id: "lea-006", question: "Describe a time you had to make a high-stakes decision with incomplete data.", difficulty: "hard", keyQuestion: false },
            { id: "lea-007", question: "How do you prioritize when everything seems equally urgent?", difficulty: "medium", keyQuestion: false }
          ]
        },
        {
          name: "Influence & Vision",
          questions: [
            { id: "lea-008", question: "How do you create buy-in for a vision that others are skeptical about?", difficulty: "hard", keyQuestion: true },
            { id: "lea-009", question: "Describe a time you had to lead through significant organizational change.", difficulty: "hard", keyQuestion: false },
            { id: "lea-010", question: "What is your leadership philosophy and how has it evolved?", difficulty: "medium", keyQuestion: false }
          ]
        }
      ]
    },

    {
      id: "cultureFit",
      label: "Culture Fit Interview",
      color: "#3B6D11",
      description: "Assesses alignment with company values, work style, and team dynamics. Reveals whether the candidate will thrive in the environment.",
      subcategories: [
        {
          name: "Values & Work Style",
          questions: [
            { id: "cul-001", question: "What type of work environment brings out your best performance?", difficulty: "easy", keyQuestion: true },
            { id: "cul-002", question: "How would your current colleagues describe your working style?", difficulty: "easy", keyQuestion: false },
            { id: "cul-003", question: "What motivates you beyond salary and title?", difficulty: "easy", keyQuestion: false },
            { id: "cul-004", question: "How do you prefer to receive feedback — in the moment or formally?", difficulty: "easy", keyQuestion: false }
          ]
        },
        {
          name: "Company & Mission Alignment",
          questions: [
            { id: "cul-005", question: "What drew you specifically to our company's mission and values?", difficulty: "medium", keyQuestion: true },
            { id: "cul-006", question: "How do your personal values align with what we stand for?", difficulty: "medium", keyQuestion: false },
            { id: "cul-007", question: "Describe a company culture where you would not thrive and why.", difficulty: "hard", keyQuestion: false }
          ]
        },
        {
          name: "Collaboration & Social Dynamics",
          questions: [
            { id: "cul-008", question: "Do you prefer making friends with coworkers outside of work? How does that affect your professional relationships?", difficulty: "easy", keyQuestion: false },
            { id: "cul-009", question: "As a manager, do you want to be involved in every decision or delegate outcomes?", difficulty: "medium", keyQuestion: false },
            { id: "cul-010", question: "Tell me about a professional relationship that didn't work out. What was the cause?", difficulty: "hard", keyQuestion: true }
          ]
        }
      ]
    },

    {
      id: "competency",
      label: "Competency-Based Interview",
      color: "#993556",
      description: "Structured interviews where each question maps to a specific job competency. Higher predictive validity than unstructured interviews.",
      subcategories: [
        {
          name: "Communication",
          questions: [
            { id: "com-001", question: "Give an example of a complex idea you had to communicate to a non-technical audience.", difficulty: "medium", keyQuestion: true },
            { id: "com-002", question: "Describe a time when miscommunication caused a problem. How did you fix it?", difficulty: "medium", keyQuestion: false },
            { id: "com-003", question: "How do you adapt your communication style for different stakeholders?", difficulty: "easy", keyQuestion: false }
          ]
        },
        {
          name: "Problem Solving",
          questions: [
            { id: "com-004", question: "Describe a situation where you had to find a creative solution under severe constraints.", difficulty: "hard", keyQuestion: true },
            { id: "com-005", question: "Tell me about a time you used data to drive a decision.", difficulty: "medium", keyQuestion: false },
            { id: "com-006", question: "Describe a time you had to solve a problem you had never encountered before.", difficulty: "hard", keyQuestion: false }
          ]
        },
        {
          name: "Adaptability",
          questions: [
            { id: "com-007", question: "Tell me about a time when your priorities shifted significantly mid-project.", difficulty: "medium", keyQuestion: false },
            { id: "com-008", question: "How have you adapted to major changes in your industry or organization?", difficulty: "medium", keyQuestion: true },
            { id: "com-009", question: "Describe a time you had to learn a new skill quickly under pressure.", difficulty: "medium", keyQuestion: false }
          ]
        },
        {
          name: "Accountability",
          questions: [
            { id: "com-010", question: "Give an example of a project where you took full ownership from start to finish.", difficulty: "medium", keyQuestion: false },
            { id: "com-011", question: "Tell me about a time you delivered results despite significant obstacles.", difficulty: "hard", keyQuestion: false },
            { id: "com-012", question: "Describe a situation where you held yourself accountable for a team failure.", difficulty: "hard", keyQuestion: true }
          ]
        }
      ]
    },

    {
      id: "roleSpecific",
      label: "Role-Specific Interview",
      color: "#3C3489",
      description: "Domain-specific questions tailored to functional areas like product, marketing, data, finance, and sales.",
      subcategories: [
        {
          name: "Product Management",
          questions: [
            { id: "rol-001", question: "How do you prioritize features on a product roadmap with competing stakeholder interests?", difficulty: "hard", keyQuestion: true },
            { id: "rol-002", question: "Walk me through how you would launch a new product from zero.", difficulty: "hard", keyQuestion: false },
            { id: "rol-003", question: "How do you define and measure the success of a product feature?", difficulty: "medium", keyQuestion: false },
            { id: "rol-004", question: "Tell me about a product you admire and what you would change about it.", difficulty: "medium", keyQuestion: false }
          ]
        },
        {
          name: "Marketing",
          questions: [
            { id: "rol-005", question: "How would you build a go-to-market strategy for a new B2B SaaS product?", difficulty: "hard", keyQuestion: false },
            { id: "rol-006", question: "Describe a campaign you led. What was the ROI and how did you measure it?", difficulty: "medium", keyQuestion: true },
            { id: "rol-007", question: "How do you approach marketing to a new audience segment you know little about?", difficulty: "hard", keyQuestion: false }
          ]
        },
        {
          name: "Data & Analytics",
          questions: [
            { id: "rol-008", question: "Walk me through how you would approach an A/B test for a checkout flow.", difficulty: "hard", keyQuestion: true },
            { id: "rol-009", question: "How do you handle missing or dirty data in a dataset before analysis?", difficulty: "medium", keyQuestion: false },
            { id: "rol-010", question: "Explain the difference between correlation and causation with an example.", difficulty: "easy", keyQuestion: false }
          ]
        },
        {
          name: "Finance",
          questions: [
            { id: "rol-011", question: "Walk me through a DCF model and explain its key assumptions.", difficulty: "hard", keyQuestion: true },
            { id: "rol-012", question: "How do you assess whether a company is undervalued?", difficulty: "hard", keyQuestion: false },
            { id: "rol-013", question: "What would cause EBITDA to rise but net income to fall?", difficulty: "hard", keyQuestion: false }
          ]
        },
        {
          name: "Sales",
          questions: [
            { id: "rol-014", question: "Sell me this pen.", difficulty: "medium", keyQuestion: true },
            { id: "rol-015", question: "Describe your sales process from prospecting to close.", difficulty: "medium", keyQuestion: false },
            { id: "rol-016", question: "Tell me about your largest deal. What was your strategy to close it?", difficulty: "hard", keyQuestion: false }
          ]
        }
      ]
    }
  ]
};

export default interviewKnowledgeBase;
