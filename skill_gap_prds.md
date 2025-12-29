# Student Skill Gap Analysis & Career Guidance System - Complete PRD Suite

## 1. MVP PRD (Minimum Viable Product)

### 1.1 Product Overview
A web-based platform that helps students identify skill gaps by comparing their current skills against industry requirements and provides personalized career recommendations with learning paths.

### 1.2 Target Users
- College students seeking career guidance
- Recent graduates exploring career options
- Students wanting to upskill for specific industries

### 1.3 Core MVP Features

#### Feature 1: Student Profile Management
**Priority:** P0 (Must Have)
- User registration with email/password
- Profile creation with fields:
  - Name, Education level, Current institution
  - Interests (tags/multi-select)
  - Current skills (searchable dropdown with proficiency levels)
- Profile editing capability
- Simple authentication (JWT-based)

**Success Metrics:**
- User can complete registration in < 3 minutes
- Profile save success rate > 95%

#### Feature 2: Skill Gap Analysis
**Priority:** P0 (Must Have)
- Compare student skills against industry requirements
- Visual representation of:
  - Matching skills (green)
  - Missing skills (red)
  - Partial matches (yellow)
- Match percentage calculation
- Top 3-5 missing critical skills highlighted

**Success Metrics:**
- Analysis completion time < 5 seconds
- Match accuracy validated against 50+ career profiles

#### Feature 3: Career Recommendations
**Priority:** P0 (Must Have)
- Generate top 3-5 career suggestions based on:
  - Current skill match percentage
  - Interest alignment
  - Industry demand
- Display per career:
  - Career title and description
  - Match score (%)
  - Required skills vs. student skills comparison
  - Average salary range (static data for MVP)

**Success Metrics:**
- Recommendation relevance score > 70% (user survey)
- Users explore at least 2 recommendations

#### Feature 4: Learning Path Suggestions
**Priority:** P1 (Should Have)
- For each missing skill, suggest:
  - Online course platforms (Coursera, Udemy, YouTube)
  - Estimated time to learn
  - Difficulty level
- Prioritized learning roadmap (skill dependency awareness)

**Success Metrics:**
- Users click through to at least 1 learning resource
- Learning path completeness score

### 1.4 Out of Scope for MVP
- Social features (forums, peer comparison)
- Job board integration
- Resume builder
- Payment/premium features
- Mobile app
- Real-time collaboration
- Progress tracking over time

### 1.5 User Journey (MVP)
1. User lands on homepage → Sign up
2. Complete profile (education, interests, skills)
3. Select target industry/career interest
4. System analyzes skill gap
5. View results dashboard with gaps highlighted
6. Explore career recommendations
7. Access learning paths for missing skills

### 1.6 Success Criteria for MVP
- 50+ users successfully complete the full flow
- Average session time > 10 minutes
- 70% of users find recommendations relevant
- System handles concurrent users without performance degradation

---

## 2. DESIGN PRD

### 2.1 Design Philosophy
- **Clean and Educational:** Professional yet approachable interface
- **Data Visualization First:** Make complex skill comparisons easy to understand
- **Mobile-Responsive:** Works on desktop, tablet, and mobile
- **Accessibility:** WCAG 2.1 AA compliant

### 2.2 Design System

#### Color Palette
- **Primary Blue:** #4F46E5 (Trust, professionalism)
- **Success Green:** #10B981 (Matching skills)
- **Warning Yellow:** #F59E0B (Partial matches)
- **Error Red:** #EF4444 (Missing skills)
- **Neutral Grays:** #F9FAFB, #E5E7EB, #6B7280, #1F2937
- **Background:** #FFFFFF, #F3F4F6

#### Typography
- **Headings:** Inter, Bold (600-700)
- **Body:** Inter, Regular (400)
- **Code/Technical:** JetBrains Mono
- **Sizes:**
  - H1: 36px
  - H2: 30px
  - H3: 24px
  - Body: 16px
  - Small: 14px

#### Spacing System
- Base unit: 8px
- Scale: 8px, 16px, 24px, 32px, 48px, 64px

### 2.3 Key Screens & Wireframes

#### Screen 1: Landing Page
**Components:**
- Hero section with value proposition
- "Get Started" CTA button
- 3-step process visualization
- Social proof (testimonials for future)
- Footer with links

**Layout:**
- Centered content, max-width 1200px
- Full-width hero with gradient background
- Card-based feature sections

#### Screen 2: Registration/Login
**Components:**
- Split screen design (left: form, right: benefits image)
- Form fields: Name, Email, Password, Confirm Password
- Social login options (future: Google, LinkedIn)
- Toggle between Login/Signup

#### Screen 3: Profile Setup
**Components:**
- Progress stepper (Step 1/3, 2/3, 3/3)
- Step 1: Basic Info (Name, Education, Institution)
- Step 2: Interests (Tag selection UI)
- Step 3: Current Skills (Searchable multi-select with proficiency sliders)
- "Save & Continue" button

**Interactions:**
- Auto-save draft
- Skill search with autocomplete
- Proficiency slider (Beginner → Expert)

#### Screen 4: Dashboard (Post-Analysis)
**Components:**
- Header with user profile dropdown
- Main content area with 3 sections:

**Section A: Skill Gap Overview**
- Circular progress chart showing match percentage
- Legend: Matched, Missing, Partial
- Overall match score (large number)

**Section B: Detailed Skill Comparison**
- Two-column layout:
  - Left: Your Skills (with proficiency bars)
  - Right: Industry Required Skills
- Color-coded badges for each skill
- Expandable details on hover

**Section C: Missing Skills Priority List**
- Ordered list cards with:
  - Skill name
  - Priority badge (Critical/Important/Nice-to-have)
  - "Learn Now" button

#### Screen 5: Career Recommendations
**Components:**
- Grid of career cards (3 columns)
- Each card shows:
  - Career title
  - Match percentage (circular progress)
  - Top 3 matching skills
  - Top 3 missing skills
  - "View Details" button

**Detailed View Modal:**
- Full career description
- Complete skill breakdown
- Salary range (chart)
- Growth potential indicator
- "Get Learning Path" CTA

#### Screen 6: Learning Path
**Components:**
- Roadmap visualization (timeline/flowchart)
- Skill nodes with:
  - Skill name
  - Estimated learning time
  - Prerequisites (connected nodes)
  - Resource cards (courses, videos, articles)
- Filters: Platform, Duration, Difficulty
- "Add to My Plan" functionality

### 2.4 UI Components Library

#### Buttons
- Primary: Filled blue, white text
- Secondary: Outlined blue, blue text
- Ghost: Text only, blue text
- States: Default, Hover, Active, Disabled

#### Form Inputs
- Text fields with floating labels
- Multi-select dropdowns with tags
- Range sliders with value display
- Validation states (error/success)

#### Cards
- Shadow elevation for depth
- Hover state with subtle lift
- Consistent padding (24px)
- Rounded corners (8px)

#### Data Visualization
- Circular progress charts (Chart.js)
- Horizontal bar charts for skill proficiency
- Color-coded badges for skill status
- Comparison tables with alternating row colors

### 2.5 Responsive Breakpoints
- Mobile: < 640px (1 column layout)
- Tablet: 640px - 1024px (2 column layout)
- Desktop: > 1024px (3 column layout)

### 2.6 Animation & Micro-interactions
- Page transitions: Fade + slide (300ms)
- Button hover: Scale 1.02, shadow increase
- Card hover: Lift 4px, shadow increase
- Loading states: Skeleton screens
- Success actions: Green checkmark animation
- Skill gap reveal: Animated progress bars (1s delay)

---

## 3. ARCHITECTURE PRD

### 3.1 System Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              CLIENT LAYER                        │
│  Next.js Frontend (React + TypeScript)          │
│  - Pages/Routes                                  │
│  - Components                                    │
│  - State Management (React Context/Zustand)     │
│  - Client-side API calls                        │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS/REST
┌──────────────────▼──────────────────────────────┐
│          APPLICATION LAYER                       │
│  Next.js API Routes (Backend)                   │
│  - Authentication middleware                     │
│  - Business logic controllers                    │
│  - API request/response handlers                │
└──────────────┬────────────────┬─────────────────┘
               │                │
               │                │
    ┌──────────▼──────┐  ┌─────▼──────────────┐
    │   DATA LAYER    │  │   EXTERNAL APIs    │
    │   MongoDB       │  │   OpenRouter API   │
    │   - Users       │  │   (GPT-4/Claude)   │
    │   - Careers     │  └────────────────────┘
    │   - Skills      │
    │   - Industries  │
    └─────────────────┘
```

### 3.2 Technology Stack Details

#### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** Zustand (lightweight) or React Context
- **Forms:** React Hook Form + Zod validation
- **Data Fetching:** SWR or TanStack Query
- **Charts:** Chart.js or Recharts

#### Backend (Next.js API Routes)
- **Runtime:** Node.js 20+
- **API Format:** RESTful JSON
- **Authentication:** NextAuth.js with JWT
- **Validation:** Zod schemas
- **Middleware:** Custom auth, rate limiting

#### Database
- **Primary DB:** MongoDB Atlas (cloud-hosted)
- **ODM:** Mongoose
- **Connection Pooling:** Built-in Mongoose pooling

#### AI/ML Integration
- **API:** OpenRouter (unified LLM gateway)
- **Models:** 
  - Primary: GPT-4 Turbo (skill analysis)
  - Fallback: Claude 3 Sonnet
- **Use Cases:**
  - Skill gap analysis and matching
  - Career recommendation generation
  - Learning path optimization

#### Hosting & Deployment
- **Platform:** Vercel (Next.js optimized)
- **CDN:** Vercel Edge Network
- **Environment:** Production, Staging

### 3.3 Detailed Component Architecture

#### Frontend Structure
```
/src
  /app
    /(auth)
      /login
      /register
    /(dashboard)
      /profile
      /analysis
      /recommendations
      /learning-path
    /api
      /auth
      /users
      /analysis
      /recommendations
      /careers
  /components
    /ui (shadcn components)
    /forms
    /charts
    /layouts
  /lib
    /api-client
    /auth
    /utils
  /types
  /hooks
  /store (state management)
```

#### API Routes Structure
```
/api
  /auth
    /[...nextauth]       # NextAuth configuration
    /register            # POST - User registration
    /login              # POST - User login
  /users
    /[id]               # GET, PUT - User profile
    /[id]/skills        # GET, PUT - User skills
  /analysis
    /skill-gap          # POST - Analyze skill gap
    /compare            # POST - Compare skills
  /recommendations
    /careers            # POST - Get career recommendations
    /learning-paths     # POST - Generate learning paths
  /careers
    /                   # GET - List all careers
    /[id]              # GET - Career details
    /[id]/skills       # GET - Required skills
  /industries
    /                   # GET - List industries
    /[id]/careers      # GET - Careers in industry
```

### 3.4 API Endpoint Specifications

#### POST /api/auth/register
```typescript
Request:
{
  name: string;
  email: string;
  password: string;
}

Response:
{
  success: boolean;
  userId: string;
  message: string;
}
```

#### POST /api/analysis/skill-gap
```typescript
Request:
{
  studentId: string;
  targetCareerIds: string[];
}

Response:
{
  careerMatches: [
    {
      careerId: string;
      careerName: string;
      matchScore: number;
      matchingSkills: Skill[];
      missingSkills: Skill[];
      partialSkills: Skill[];
    }
  ];
  overallMatch: number;
}
```

#### POST /api/recommendations/careers
```typescript
Request:
{
  studentId: string;
  interests: string[];
  currentSkills: Skill[];
}

Response:
{
  recommendations: [
    {
      careerId: string;
      careerName: string;
      matchScore: number;
      description: string;
      salaryRange: { min: number; max: number };
      requiredSkills: Skill[];
      reasoning: string; // AI-generated explanation
    }
  ];
}
```

### 3.5 Authentication Flow
1. User registers → Password hashed (bcrypt)
2. JWT token generated with payload: `{ userId, email, exp }`
3. Token stored in httpOnly cookie
4. Protected routes check token via middleware
5. Token refresh on expiry (24h default)

### 3.6 AI Integration Architecture

#### OpenRouter Integration Pattern
```typescript
// Centralized AI service
class AIService {
  async analyzeSkillGap(
    studentSkills: Skill[],
    requiredSkills: Skill[]
  ): Promise<AnalysisResult> {
    const prompt = buildSkillGapPrompt(studentSkills, requiredSkills);
    const response = await openrouter.chat({
      model: "openai/gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3, // Lower for consistency
    });
    return parseAnalysisResponse(response);
  }

  async recommendCareers(
    profile: StudentProfile
  ): Promise<CareerRecommendation[]> {
    // Similar pattern with structured prompts
  }
}
```

#### Prompt Engineering Strategy
- **Skill Gap Analysis Prompt:**
  - Provide student skills with proficiency levels
  - Provide industry required skills
  - Request structured JSON response with match scores
  - Include specific criteria for "matching" vs "partial" vs "missing"

- **Career Recommendation Prompt:**
  - Input: Student profile, interests, skills
  - Input: Available career database (via context)
  - Request: Top 5 careers with reasoning
  - Output: JSON with career IDs, match scores, explanations

### 3.7 Performance Optimization

#### Caching Strategy
- **Client-side:** SWR with 5-minute cache for career/skill data
- **Server-side:** Redis cache for AI responses (1-hour TTL)
- **Database:** MongoDB indexes on frequently queried fields

#### Rate Limiting
- API routes: 100 requests/minute per IP
- AI endpoints: 10 requests/minute per user (cost control)
- Authentication: 5 failed attempts → 15-minute lockout

#### Code Splitting
- Route-based splitting (automatic with Next.js)
- Dynamic imports for heavy components (charts)
- Lazy loading for career detail modals

### 3.8 Error Handling & Logging

#### Error Hierarchy
```typescript
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

class ValidationError extends AppError // 400
class UnauthorizedError extends AppError // 401
class NotFoundError extends AppError // 404
class ExternalAPIError extends AppError // 502
```

#### Logging Strategy
- **Development:** Console logs with colors
- **Production:** Structured JSON logs
- **Critical Errors:** Send to monitoring service (Sentry)
- **AI API Calls:** Log prompts, responses, latency

### 3.9 Security Measures
- Input validation on all API routes (Zod)
- SQL/NoSQL injection prevention (Mongoose sanitization)
- XSS prevention (React escaping + CSP headers)
- CSRF protection (NextAuth built-in)
- Rate limiting on auth endpoints
- Secure headers (helmet.js equivalent)
- Environment variable protection (.env.local)

---

## 4. DATABASE PRD

### 4.1 Database Selection Rationale
**MongoDB** chosen for:
- Flexible schema for evolving career/skill data
- JSON-like documents align with API responses
- Easy integration with Next.js
- Scalability for future growth
- Rich querying for skill matching algorithms

### 4.2 Database Schema Design

#### Collection: users
```javascript
{
  _id: ObjectId,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  profile: {
    name: String,
    education: {
      level: String, // "High School", "Bachelor's", "Master's"
      institution: String,
      fieldOfStudy: String,
      graduationYear: Number
    },
    interests: [String], // ["Web Development", "AI", "Data Science"]
    bio: String
  },
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}

// Indexes
users.createIndex({ email: 1 }, { unique: true });
users.createIndex({ "profile.interests": 1 });
```

#### Collection: user_skills
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to users
  skills: [
    {
      skillId: ObjectId, // Reference to skills collection
      skillName: String, // Denormalized for quick access
      proficiencyLevel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced", "Expert"]
      },
      proficiencyScore: Number, // 1-100
      yearsOfExperience: Number,
      acquiredDate: Date,
      lastUpdated: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}

// Indexes
user_skills.createIndex({ userId: 1 }, { unique: true });
user_skills.createIndex({ "skills.skillId": 1 });
```

#### Collection: skills (Master Skill Database)
```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ["Technical", "Soft Skills", "Domain Knowledge", "Tools"]
  },
  subcategory: String, // "Programming", "Design", "Communication"
  description: String,
  relatedSkills: [ObjectId], // References to related skills
  aliases: [String], // Alternative names for matching
  demandScore: Number, // 1-100, industry demand metric
  avgSalaryImpact: Number, // Percentage impact on salary
  createdAt: Date,
  updatedAt: Date
}

// Indexes
skills.createIndex({ name: 1 }, { unique: true });
skills.createIndex({ category: 1, subcategory: 1 });
skills.createIndex({ demandScore: -1 }); // Descending for top skills
```

#### Collection: careers
```javascript
{
  _id: ObjectId,
  title: {
    type: String,
    required: true
  },
  alternativeTitles: [String], // "Software Engineer", "Software Developer"
  industryId: ObjectId, // Reference to industries
  description: String,
  responsibilities: [String],
  careerPath: {
    entryLevel: String,
    midLevel: String,
    seniorLevel: String
  },
  salaryData: {
    currency: String,
    entryLevel: { min: Number, max: Number },
    midLevel: { min: Number, max: Number },
    seniorLevel: { min: Number, max: Number }
  },
  growthOutlook: {
    type: String,
    enum: ["Declining", "Stable", "Growing", "High Growth"]
  },
  demandScore: Number, // 1-100
  createdAt: Date,
  updatedAt: Date
}

// Indexes
careers.createIndex({ title: 1 });
careers.createIndex({ industryId: 1 });
careers.createIndex({ demandScore: -1 });
```

#### Collection: career_skills (Required Skills per Career)
```javascript
{
  _id: ObjectId,
  careerId: ObjectId, // Reference to careers
  requiredSkills: [
    {
      skillId: ObjectId, // Reference to skills
      skillName: String, // Denormalized
      importance: {
        type: String,
        enum: ["Critical", "Important", "Nice-to-have"]
      },
      minimumProficiency: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced", "Expert"]
      },
      weight: Number // 1-10, for matching algorithm
    }
  ],
  createdAt: Date,
  updatedAt: Date
}

// Indexes
career_skills.createIndex({ careerId: 1 }, { unique: true });
career_skills.createIndex({ "requiredSkills.skillId": 1 });
```

#### Collection: industries
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  sector: String, // "Technology", "Healthcare", "Finance"
  growthRate: Number, // Annual percentage
  createdAt: Date,
  updatedAt: Date
}

// Indexes
industries.createIndex({ name: 1 }, { unique: true });
```

#### Collection: learning_resources
```javascript
{
  _id: ObjectId,
  skillId: ObjectId, // Reference to skills
  title: String,
  provider: String, // "Coursera", "Udemy", "YouTube"
  url: String,
  type: {
    type: String,
    enum: ["Course", "Video", "Article", "Book", "Tutorial"]
  },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"]
  },
  duration: String, // "4 weeks", "10 hours"
  cost: {
    amount: Number,
    currency: String,
    isFree: Boolean
  },
  rating: Number, // 1-5
  reviewCount: Number,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
learning_resources.createIndex({ skillId: 1 });
learning_resources.createIndex({ provider: 1 });
learning_resources.createIndex({ rating: -1 });
```

#### Collection: analyses (Stored Analysis Results)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  targetCareerId: ObjectId,
  analysisDate: Date,
  results: {
    matchScore: Number, // Overall percentage
    matchingSkills: [
      {
        skillId: ObjectId,
        skillName: String,
        userProficiency: String,
        requiredProficiency: String
      }
    ],
    missingSkills: [
      {
        skillId: ObjectId,
        skillName: String,
        importance: String,
        requiredProficiency: String
      }
    ],
    partialSkills: [
      {
        skillId: ObjectId,
        skillName: String,
        userProficiency: String,
        requiredProficiency: String,
        gap: String // "Need to improve from Intermediate to Advanced"
      }
    ]
  },
  aiInsights: String, // GPT-generated summary
  createdAt: Date
}

// Indexes
analyses.createIndex({ userId: 1, analysisDate: -1 });
analyses.createIndex({ targetCareerId: 1 });
```

#### Collection: recommendations (Stored Career Recommendations)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  generatedAt: Date,
  recommendations: [
    {
      careerId: ObjectId,
      careerTitle: String,
      matchScore: Number,
      reasoning: String, // AI-generated
      topMatchingSkills: [String],
      topMissingSkills: [String],
      estimatedTimeToReady: String // "3-6 months"
    }
  ],
  createdAt: Date
}

// Indexes
recommendations.createIndex({ userId: 1, generatedAt: -1 });
```

### 4.3 Data Relationships

```
users (1) ──────────── (1) user_skills
  │                             │
  │                             └─→ skills (Many-to-Many via embedded array)
  │
  ├──────────→ analyses (1-to-Many)
  │                 └─→ careers
  │
  └──────────→ recommendations (1-to-Many)
                      └─→ careers

careers (1) ─────────── (1) career_skills
  │                            └─→ skills (Many-to-Many)
  │
  └─────────→ industries (Many-to-1)

skills (1) ──────────→ learning_resources (1-to-Many)
```

### 4.4 Sample Data Population

#### Initial Skills Database (Examples)
```javascript
// Technical Skills
{ name: "JavaScript", category: "Technical", subcategory: "Programming" }
{ name: "React", category: "Technical", subcategory: "Web Framework" }
{ name: "Python", category: "Technical", subcategory: "Programming" }
{ name: "Machine Learning", category: "Technical", subcategory: "AI/ML" }
{ name: "SQL", category: "Technical", subcategory: "Database" }

// Soft Skills
{ name: "Communication", category: "Soft Skills", subcategory: "Interpersonal" }
{ name: "Leadership", category: "Soft Skills", subcategory: "Management" }
{ name: "Problem Solving", category: "Soft Skills", subcategory: "Critical Thinking" }

// Tools
{ name: "Git", category: "Tools", subcategory: "Version Control" }
{ name: "Docker", category: "Tools", subcategory: "DevOps" }
```

#### Sample Career Profiles
```javascript
{
  title: "Full Stack Developer",
  description: "Builds and maintains web applications...",
  requiredSkills: [
    { skillName: "JavaScript", importance: "Critical", minimumProficiency: "Advanced" },
    { skillName: "React", importance: "Critical", minimumProficiency: "Intermediate" },
    { skillName: "Node.js", importance: "Important", minimumProficiency: "Intermediate" },
    { skillName: "SQL", importance: "Important", minimumProficiency: "Intermediate" },
    { skillName: "Git", importance: "Critical", minimumProficiency: "Intermediate" }
  ]
}
```

### 4.5 Database Operations & Queries

#### Common Query Patterns

**1. Get User Profile with Skills**
```javascript
const userWithSkills = await User.aggregate([
  { $match: { _id: userId } },
  {
    $lookup: {
      from: "user_skills",
      localField: "_id",
      foreignField: "userId",
      as: "skillsData"
    }
  },
  { $unwind: "$skillsData" }
]);
```

**2. Find Careers by Skill Match**
```javascript
const matchingCareers = await CareerSkill.aggregate([
  {
    $match: {
      "requiredSkills.skillId": { $in: userSkillIds }
    }
  },
  {
    $lookup: {
      from: "careers",
      localField: "careerId",
      foreignField: "_id",
      as: "careerDetails"
    }
  },
  {
    $addFields: {
      matchCount: {
        $size: {
          $setIntersection: [
            "$requiredSkills.skillId",
            userSkillIds
          ]
        }
      }
    }
  },
  { $sort: { matchCount: -1 } },
  { $limit: 10 }
]);
```

**3. Get Learning Resources for Missing Skills**
```javascript
const resources = await LearningResource.find({
  skillId: { $in: missingSkillIds },
  difficulty: { $in: ["Beginner", "Intermediate"] }
})
  .sort({ rating: -1, reviewCount: -1 })
  .limit(5);
```

### 4.6 Database Seeding Strategy

#### Seed Data Priority
1. **Phase 1 (MVP):**
   - 100+ core technical skills
   - 50 soft skills
   - 20 popular careers (Tech, Business, Design)
   - 10 industries
   - 200+ learning resources

2. **Phase 2 (Post-MVP):**
   - Expand to 500+ skills
   - 100+ careers across all industries
   - User-contributed skill data
   - Real-time salary data integration

#### Data Sources for Seeding
- **Skills:** O*NET Database, LinkedIn Skills, GitHub Topics
- **Careers:** Bureau of Labor Statistics, LinkedIn Job Postings
- **Learning Resources:** Coursera API, Udemy API, YouTube API
- **Salary Data:** Glassdoor, PayScale APIs (static for MVP)

### 4.7 Database Backup & Migration
- **Backup:** Daily automated backups via MongoDB Atlas
- **Migration:** Mongoose migration scripts in `/db/migrations`
- **Versioning:** Schema version field in each document

### 4.8 Performance Optimization
- **Denormalization:** Skill names stored with IDs to reduce joins
- **Indexes:** All foreign keys and frequently queried fields
- **Connection Pooling:** Max 10 connections (Mongoose default)
- **Query Optimization:** Use aggregation pipelines over multiple queries

---

## 5. AI/ML INTEGRATION SPECIFICATIONS

### 5.1 OpenRouter Configuration

```typescript
// lib/openrouter.ts
import OpenAI from "openai";

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL,
    "X-Title": "SkillGap Analyzer",
  }
});

export const AI_MODELS = {
  primary: "openai/gpt-4-turbo",
  fallback: "anthropic/claude-3-sonnet",
  budget: "openai/gpt-3.5-turbo"
};
```

### 5.2 Prompt Templates

#### Skill Gap Analysis Prompt
```typescript
const SKILL_GAP_PROMPT = `
You are a career guidance AI analyzing skill gaps for students.

STUDENT PROFILE:
- Current Skills: ${JSON.stringify(studentSkills)}
- Interests: ${interests.join(", ")}
- Education: ${education}

TARGET CAREER:
- Career: ${careerName}
- Required Skills: ${JSON.