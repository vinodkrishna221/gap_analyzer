# Feature Slices - Student Skill Gap Analysis System
## 4-Member Team | Vertical Slice Architecture

---

## 🎯 Project Overview
A career guidance platform where students analyze skill gaps, get career recommendations, and receive personalized learning paths. Each team member owns a complete vertical slice from database to UI.

---

## 📁 Project Structure

```
skill-gap-analyzer/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/                    # Member 1
│   │   │   │   └── page.tsx
│   │   │   └── register/                 # Member 1
│   │   │       └── page.tsx
│   │   ├── dashboard/                    # Member 2
│   │   │   └── page.tsx
│   │   ├── analysis/                     # Member 3
│   │   │   └── page.tsx
│   │   └── recommendations/              # Member 4
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/                         # Member 1
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   └── [...nextauth]/route.ts
│   │   ├── profile/                      # Member 2
│   │   │   └── route.ts
│   │   ├── analysis/                     # Member 3
│   │   │   └── skill-gap/route.ts
│   │   └── recommendations/              # Member 4
│   │       ├── careers/route.ts
│   │       └── learning-paths/route.ts
│   ├── components/
│   │   ├── auth/                         # Member 1
│   │   ├── dashboard/                    # Member 2
│   │   ├── analysis/                     # Member 3
│   │   └── recommendations/              # Member 4
│   ├── lib/
│   │   ├── db/
│   │   │   ├── models/
│   │   │   │   ├── User.ts              # Member 1
│   │   │   │   ├── UserSkill.ts         # Member 2
│   │   │   │   ├── Analysis.ts          # Member 3
│   │   │   │   ├── Career.ts            # Member 4
│   │   │   │   └── shared.ts            # Shared types
│   │   │   └── connection.ts            # Shared DB connection
│   │   ├── openrouter.ts                # Member 3 & 4 (AI service)
│   │   └── utils.ts                     # Shared utilities
│   └── types/
│       └── index.ts                     # Shared TypeScript types
├── .env.local
└── package.json
```

---

## 🎨 Shared Standards

### Design System
**Colors** (Tailwind CSS classes):
- Primary: `blue-600` (#4F46E5)
- Success: `green-500` (#10B981)
- Warning: `yellow-500` (#F59E0B)
- Error: `red-500` (#EF4444)
- Background: `gray-50` (#F9FAFB)
- Text: `gray-900` (#1F2937)

**Typography**:
- Font: Inter (via Tailwind)
- Headings: `text-2xl font-bold` to `text-4xl font-bold`
- Body: `text-base text-gray-700`

**Spacing**: Use Tailwind's spacing scale (4, 6, 8, 12, 16, 24, 32)

**Components**: Use shadcn/ui components for consistency
- Button, Input, Card, Badge, Progress, Select

### API Response Format
All API routes must return this structure:

```typescript
// Success Response
{
  success: true,
  data: { /* your data */ },
  message?: string
}

// Error Response
{
  success: false,
  error: string,
  details?: any
}
```

### Authentication Interface
All protected routes must:
1. Check for JWT token in cookies
2. Attach `userId` to the request
3. Return 401 if unauthorized

**Shared Interface**: After login, all features access `session.user.id` for the logged-in user.

---

## 👥 Feature Assignments

| Member | Feature Name | Page Route | API Route | DB Models | Estimated Hours |
|--------|-------------|------------|-----------|-----------|-----------------|
| **Member 1** | Authentication & User Management | `/login`, `/register` | `/api/auth/*` | `User` | 12h |
| **Member 2** | Profile & Skills Management | `/dashboard` | `/api/profile`, `/api/profile/skills` | `UserSkill`, `Skill` | 12h |
| **Member 3** | Skill Gap Analysis | `/analysis` | `/api/analysis/skill-gap` | `Analysis`, `CareerSkill` | 13h |
| **Member 4** | Career Recommendations & Learning Paths | `/recommendations` | `/api/recommendations/*` | `Career`, `LearningResource` | 13h |

---

## 🧑‍💻 Member 1: Authentication & User Management

### 🎯 Feature Overview
Build the complete authentication system including user registration, login, session management, and logout. This is the foundation that enables all other features.

### 📋 Tasks Breakdown

#### 1. Database Models (2 hours)
**File**: `src/lib/db/models/User.ts`

```typescript
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  profile: {
    name: { type: String, required: true },
    education: {
      level: String, // "High School", "Bachelor's", "Master's", "PhD"
      institution: String,
      fieldOfStudy: String,
      graduationYear: Number
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
```

**File**: `src/lib/db/connection.ts` (Shared - setup once)

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

#### 2. API Routes (4 hours)

**File**: `src/app/api/auth/register/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { email, password, name, education } = await req.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      profile: { name, education }
    });

    return NextResponse.json({
      success: true,
      data: { userId: user._id, email: user.email },
      message: 'Registration successful'
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**File**: `src/app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models/User';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();
        
        const user = await User.findOne({ email: credentials?.email });
        if (!user) throw new Error('Invalid credentials');

        const isValid = await bcrypt.compare(
          credentials?.password || '', 
          user.passwordHash
        );
        if (!isValid) throw new Error('Invalid credentials');

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.profile.name
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };
```

#### 3. UI Components (4 hours)

**File**: `src/app/(auth)/register/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (data.success) {
        router.push('/login?registered=true');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Login here
          </a>
        </p>
      </Card>
    </div>
  );
}
```

**File**: `src/app/(auth)/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome Back</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register here
          </a>
        </p>
      </Card>
    </div>
  );
}
```

#### 4. Testing & Integration (2 hours)

**Test Checklist**:
- [ ] User can register with valid email/password
- [ ] Duplicate email registration is prevented
- [ ] Password is hashed in database (never plain text)
- [ ] User can login with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Session persists after login (check with `useSession()`)
- [ ] Protected routes redirect to login if not authenticated

**Integration Points**:
- Export `userId` via NextAuth session for other members to use
- Other members can protect routes with:
  ```typescript
  import { getServerSession } from 'next-auth';
  const session = await getServerSession();
  if (!session) return NextResponse.json({success: false}, {status: 401});
  ```

---

## 🧑‍💻 Member 2: Profile & Skills Management

### 🎯 Feature Overview
Build the dashboard where users can view and edit their profile, add/update skills with proficiency levels, and select interests. This feature feeds data to the analysis engine.

### 📋 Tasks Breakdown

#### 1. Database Models (2 hours)

**File**: `src/lib/db/models/UserSkill.ts`

```typescript
import mongoose from 'mongoose';

const UserSkillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: [{
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    },
    skillName: String, // Denormalized for quick access
    proficiencyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    },
    proficiencyScore: {
      type: Number,
      min: 0,
      max: 100
    },
    addedDate: { type: Date, default: Date.now }
  }],
  interests: [String], // ["Web Development", "AI", "Data Science"]
  updatedAt: { type: Date, default: Date.now }
});

export const UserSkill = mongoose.models.UserSkill || 
  mongoose.model('UserSkill', UserSkillSchema);
```

**File**: `src/lib/db/models/Skill.ts` (Master Skills Database)

```typescript
import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['Technical', 'Soft Skills', 'Tools', 'Domain Knowledge']
  },
  subcategory: String,
  description: String,
  demandScore: Number // 0-100, for sorting popular skills
});

export const Skill = mongoose.models.Skill || 
  mongoose.model('Skill', SkillSchema);
```

**Seed Script**: `src/lib/db/seeds/skills.ts` (Run once to populate)

```typescript
export const initialSkills = [
  { name: 'JavaScript', category: 'Technical', subcategory: 'Programming', demandScore: 95 },
  { name: 'Python', category: 'Technical', subcategory: 'Programming', demandScore: 93 },
  { name: 'React', category: 'Technical', subcategory: 'Frontend', demandScore: 90 },
  { name: 'Node.js', category: 'Technical', subcategory: 'Backend', demandScore: 85 },
  { name: 'SQL', category: 'Technical', subcategory: 'Database', demandScore: 88 },
  { name: 'Git', category: 'Tools', subcategory: 'Version Control', demandScore: 92 },
  { name: 'Communication', category: 'Soft Skills', subcategory: 'Interpersonal', demandScore: 87 },
  { name: 'Problem Solving', category: 'Soft Skills', subcategory: 'Critical Thinking', demandScore: 89 },
  { name: 'Machine Learning', category: 'Technical', subcategory: 'AI/ML', demandScore: 82 },
  { name: 'Docker', category: 'Tools', subcategory: 'DevOps', demandScore: 78 },
  // Add 50+ more skills here
];
```

#### 2. API Routes (4 hours)

**File**: `src/app/api/profile/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models/User';

// GET: Fetch user profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(session.user.id).select('-passwordHash');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { profile: user.profile, email: user.email }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, education } = await req.json();

    await connectDB();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          'profile.name': name,
          'profile.education': education,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: { profile: user.profile },
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**File**: `src/app/api/profile/skills/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { Skill } from '@/lib/db/models/Skill';

// GET: Fetch user skills
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    let userSkills = await UserSkill.findOne({ userId: session.user.id });

    if (!userSkills) {
      // Create empty skills document if doesn't exist
      userSkills = await UserSkill.create({
        userId: session.user.id,
        skills: [],
        interests: []
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        skills: userSkills.skills,
        interests: userSkills.interests
      }
    });

  } catch (error) {
    console.error('Skills fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add or update skills
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { skills, interests } = await req.json();

    await connectDB();

    // Convert proficiency level to score
    const proficiencyMap = {
      'Beginner': 25,
      'Intermediate': 50,
      'Advanced': 75,
      'Expert': 100
    };

    const processedSkills = skills.map((skill: any) => ({
      skillId: skill.skillId,
      skillName: skill.skillName,
      proficiencyLevel: skill.proficiencyLevel,
      proficiencyScore: proficiencyMap[skill.proficiencyLevel as keyof typeof proficiencyMap],
      addedDate: skill.addedDate || new Date()
    }));

    const userSkills = await UserSkill.findOneAndUpdate(
      { userId: session.user.id },
      {
        $set: {
          skills: processedSkills,
          interests: interests || [],
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: { skills: userSkills.skills, interests: userSkills.interests },
      message: 'Skills updated successfully'
    });

  } catch (error) {
    console.error('Skills update error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
```

**File**: `src/app/api/skills/search/route.ts` (Search available skills)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Skill } from '@/lib/db/models/Skill';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    await connectDB();
    const skills = await Skill.find({
      name: { $regex: query, $options: 'i' }
    })
    .sort({ demandScore: -1 })
    .limit(20)
    .select('_id name category subcategory');

    return NextResponse.json({
      success: true,
      data: { skills }
    });

  } catch (error) {
    console.error('Skills search error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
```

#### 3. UI Components (5 hours)

**File**: `src/app/dashboard/page.tsx`

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SkillManager } from '@/components/dashboard/SkillManager';
import { ProfileEditor } from '@/components/dashboard/ProfileEditor';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const [profileRes, skillsRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/profile/skills')
      ]);

      const profileData = await profileRes.json();
      const skillsData = await skillsRes.json();

      if (profileData.success) setProfile(profileData.data.profile);
      if (skillsData.success) {
        setSkills(skillsData.data.skills);
        setInterests(skillsData.data.interests);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Dashboard</h1>

        {/* Profile Section */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
          <ProfileEditor profile={profile} onUpdate={fetchData} />
        </Card>

        {/* Skills Section */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">My Skills</h2>
          <SkillManager 
            skills={skills} 
            interests={interests}
            onUpdate={fetchData} 
          />
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-3xl font-bold text-blue-600">{skills.length}</div>
            <div className="text-gray-600">Skills Added</div>
          </Card>
          <Card className="p-4">
            <div className="text-3xl font-bold text-green-600">{interests.length}</div>
            <div className="text-gray-600">Interests</div>
          </Card>
          <Card className="p-4">
            <Button 
              className="w-full" 
              onClick={() => router.push('/analysis')}
              disabled={skills.length === 0}
            >
              Analyze Skill Gap →
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

**File**: `src/components/dashboard/SkillManager.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export function SkillManager({ skills, interests, onUpdate }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState(skills);
  const [newInterest, setNewInterest] = useState('');
  const [currentInterests, setCurrentInterests] = useState(interests);
  const [saving, setSaving] = useState(false);

  const searchSkills = async (query: string) => {
    if (query.length < 2) return;
    const res = await fetch(`/api/skills/search?q=${query}`);
    const data = await res.json();
    if (data.success) setSearchResults(data.data.skills);
  };

  const addSkill = (skill: any) => {
    if (selectedSkills.find((s: any) => s.skillId === skill._id)) return;
    
    setSelectedSkills([...selectedSkills, {
      skillId: skill._id,
      skillName: skill.name,
      proficiencyLevel: 'Beginner',
      addedDate: new Date()
    }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateSkillProficiency = (skillId: string, level: string) => {
    setSelectedSkills(selectedSkills.map((s: any) => 
      s.skillId === skillId ? { ...s, proficiencyLevel: level } : s
    ));
  };

  const removeSkill = (skillId: string) => {
    setSelectedSkills(selectedSkills.filter((s: any) => s.skillId !== skillId));
  };

  const addInterest = () => {
    if (newInterest && !currentInterests.includes(newInterest)) {
      setCurrentInterests([...currentInterests, newInterest]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setCurrentInterests(currentInterests.filter((i: string) => i !== interest));
  };

  const saveSkills = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: selectedSkills,
          interests: currentInterests
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Skills saved successfully!');
        onUpdate();
      }
    } catch (error) {
      alert('Error saving skills');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Skill Search */}
      <div>
        <label className="block text-sm font-medium mb-2">Add Skills</label>
        <div className="relative">
          <Input
            placeholder="Search for skills (e.g., JavaScript, Python...)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchSkills(e.target.value);
            }}
          />
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-y-auto">
              {searchResults.map((skill) => (
                <div
                  key={skill._id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => addSkill(skill)}
                >
                  <div className="font-medium">{skill.name}</div>
                  <div className="text-xs text-gray-500">{skill.category} - {skill.subcategory}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Skills */}
      <div>
        <label className="block text-sm font-medium mb-2">Your Skills ({selectedSkills.length})</label>
        <div className="space-y-3">
          {selectedSkills.map((skill: any) => (
            <div key={skill.skillId} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <div className="flex-1">
                <div className="font-medium">{skill.skillName}</div>
              </div>
              <select
                value={skill.proficiencyLevel}
                onChange={(e) => updateSkillProficiency(skill.skillId, e.target.value)}
                className="border rounded px-3 py-1"
              >
                {PROFICIENCY_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSkill(skill.skillId)}
              >
                Remove
              </Button>
            </div>
          ))}
          {selectedSkills.length === 0 && (
            <div className="text-gray-500 text-center py-4">
              No skills added yet. Search above to add skills.
            </div>
          )}
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="block text-sm font-medium mb-2">Interests</label>
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Add interest (e.g., Web Development, AI)"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addInterest()}
          />
          <Button onClick={addInterest}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentInterests.map((interest: string) => (
            <Badge key={interest} className="px-3 py-1">
              {interest}
              <button
                onClick={() => removeInterest(interest)}
                className="ml-2 text-red-500"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <Button 
        onClick={saveSkills} 
        disabled={saving}
        className="w-full"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
```

#### 4. Testing & Integration (1 hour)

**Test Checklist**:
- [ ] User can add skills via search
- [ ] Proficiency levels can be changed
- [ ] Skills persist after page reload
- [ ] Interests can be added/removed
- [ ] Save button updates database
- [ ] Skills data is accessible to Member 3 (Analysis feature)

**Integration Points**:
- Export user skills via `/api/profile/skills` GET endpoint
- Member 3 will fetch this data for analysis

---

## 🧑‍💻 Member 3: Skill Gap Analysis

### 🎯 Feature Overview
Build the core analysis engine that compares student skills against career requirements using AI, calculates match scores, and visualizes gaps with charts.

### 📋 Tasks Breakdown

#### 1. Database Models (2 hours)

**File**: `src/lib/db/models/CareerSkill.ts`

```typescript
import mongoose from 'mongoose';

const CareerSkillSchema = new mongoose.Schema({
  careerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Career',
    required: true,
    unique: true
  },
  requiredSkills: [{
    skillId: mongoose.Schema.Types.ObjectId,
    skillName: String,
    importance: {
      type: String,
      enum: ['Critical', 'Important', 'Nice-to-have']
    },
    minimumProficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    },
    weight: Number // 1-10 for matching algorithm
  }],
  updatedAt: { type: Date, default: Date.now }
});

export const CareerSkill = mongoose.models.CareerSkill || 
  mongoose.model('CareerSkill', CareerSkillSchema);
```

**File**: `src/lib/db/models/Analysis.ts`

```typescript
import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetCareerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Career'
  },
  targetCareerName: String,
  analysisDate: { type: Date, default: Date.now },
  results: {
    matchScore: Number,
    matchingSkills: [{
      skillName: String,
      userProficiency: String,
      requiredProficiency: String
    }],
    missingSkills: [{
      skillName: String,
      importance: String,
      requiredProficiency: String
    }],
    partialSkills: [{
      skillName: String,
      userProficiency: String,
      requiredProficiency: String,
      gap: String
    }]
  },
  aiInsights: String
});

export const Analysis = mongoose.models.Analysis || 
  mongoose.model('Analysis', AnalysisSchema);
```

**Seed Career Skills** (Add to Member 4's Career model or create separate seed):

```typescript
export const sampleCareerSkills = [
  {
    careerName: 'Full Stack Developer',
    requiredSkills: [
      { skillName: 'JavaScript', importance: 'Critical', minimumProficiency: 'Advanced', weight: 10 },
      { skillName: 'React', importance: 'Critical', minimumProficiency: 'Intermediate', weight: 9 },
      { skillName: 'Node.js', importance: 'Important', minimumProficiency: 'Intermediate', weight: 8 },
      { skillName: 'SQL', importance: 'Important', minimumProficiency: 'Intermediate', weight: 7 },
      { skillName: 'Git', importance: 'Critical', minimumProficiency: 'Intermediate', weight: 8 }
    ]
  }
  // Add 10+ more careers
];
```

#### 2. AI Service (3 hours)

**File**: `src/lib/openrouter.ts`

```typescript
import OpenAI from 'openai';

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "SkillGap Analyzer",
  }
});

export const AI_MODELS = {
  primary: "openai/gpt-4-turbo",
  fallback: "anthropic/claude-3-sonnet"
};

export async function analyzeSkillGap(
  userSkills: any[],
  requiredSkills: any[],
  careerName: string
): Promise<string> {
  const prompt = `
You are a career guidance AI analyzing skill gaps.

STUDENT SKILLS:
${userSkills.map(s => `- ${s.skillName} (${s.proficiencyLevel})`).join('\n')}

REQUIRED SKILLS FOR ${careerName}:
${requiredSkills.map(s => `- ${s.skillName} (${s.importance}, need ${s.minimumProficiency})`).join('\n')}

Provide a brief analysis (3-4 sentences) covering:
1. Overall readiness for this career
2. Top 2-3 strengths
3. Most critical gaps to address
4. Estimated time to become job-ready

Be encouraging but realistic.
`;

  try {
    const response = await openrouter.chat.completions.create({
      model: AI_MODELS.primary,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300
    });

    return response.choices[0].message.content || "Analysis unavailable";
  } catch (error) {
    console.error('AI analysis error:', error);
    return "Unable to generate AI insights at this time.";
  }
}
```

#### 3. API Route (4 hours)

**File**: `src/app/api/analysis/skill-gap/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { Career } from '@/lib/db/models/Career';
import { CareerSkill } from '@/lib/db/models/CareerSkill';
import { Analysis } from '@/lib/db/models/Analysis';
import { analyzeSkillGap } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { careerIds } = await req.json(); // Array of career IDs to analyze

    await connectDB();

    // Fetch user skills
    const userSkillsDoc = await UserSkill.findOne({ userId: session.user.id });
    if (!userSkillsDoc || userSkillsDoc.skills.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No skills found. Please add skills in your profile first.'
      }, { status: 400 });
    }

    const userSkills = userSkillsDoc.skills;

    // Analyze each career
    const analyses = [];
    
    for (const careerId of careerIds.slice(0, 5)) { // Limit to 5 careers
      const career = await Career.findById(careerId);
      if (!career) continue;

      const careerSkillsDoc = await CareerSkill.findOne({ careerId });
      if (!careerSkillsDoc) continue;

      const requiredSkills = careerSkillsDoc.requiredSkills;

      // Calculate match
      const analysis = calculateSkillMatch(userSkills, requiredSkills);
      
      // Get AI insights
      const aiInsights = await analyzeSkillGap(userSkills, requiredSkills, career.title);

      // Save analysis
      const savedAnalysis = await Analysis.create({
        userId: session.user.id,
        targetCareerId: careerId,
        targetCareerName: career.title,
        results: analysis,
        aiInsights
      });

      analyses.push({
        careerId: career._id,
        careerName: career.title,
        matchScore: analysis.matchScore,
        matchingSkills: analysis.matchingSkills,
        missingSkills: analysis.missingSkills,
        partialSkills: analysis.partialSkills,
        aiInsights
      });
    }

    return NextResponse.json({
      success: true,
      data: { analyses }
    });

  } catch (error) {
    console.error('Skill gap analysis error:', error);
    return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 });
  }
}

// Helper function to calculate skill match
function calculateSkillMatch(userSkills: any[], requiredSkills: any[]) {
  const proficiencyScores: {[key: string]: number} = {
    'Beginner': 25,
    'Intermediate': 50,
    'Advanced': 75,
    'Expert': 100
  };

  const matchingSkills: any[] = [];
  const missingSkills: any[] = [];
  const partialSkills: any[] = [];

  let totalWeight = 0;
  let achievedWeight = 0;

  requiredSkills.forEach((required) => {
    const userSkill = userSkills.find(s => s.skillName === required.skillName);
    const weight = required.weight || 5;
    totalWeight += weight;

    if (!userSkill) {
      // Missing skill
      missingSkills.push({
        skillName: required.skillName,
        importance: required.importance,
        requiredProficiency: required.minimumProficiency
      });
    } else {
      const userLevel = proficiencyScores[userSkill.proficiencyLevel];
      const requiredLevel = proficiencyScores[required.minimumProficiency];

      if (userLevel >= requiredLevel) {
        // Matching skill
        matchingSkills.push({
          skillName: required.skillName,
          userProficiency: userSkill.proficiencyLevel,
          requiredProficiency: required.minimumProficiency
        });
        achievedWeight += weight;
      } else {
        // Partial skill
        partialSkills.push({
          skillName: required.skillName,
          userProficiency: userSkill.proficiencyLevel,
          requiredProficiency: required.minimumProficiency,
          gap: `Need to improve from ${userSkill.proficiencyLevel} to ${required.minimumProficiency}`
        });
        achievedWeight += (userLevel / requiredLevel) * weight; // Partial credit
      }
    }
  });

  const matchScore = totalWeight > 0 ? Math.round((achievedWeight / totalWeight) * 100) : 0;

  return {
    matchScore,
    matchingSkills,
    missingSkills,
    partialSkills
  };
}
```

#### 4. UI Components (3 hours)

**File**: `src/app/analysis/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function AnalysisPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedCareers, setSelectedCareers] = useState<string[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<'select' | 'results'>('select');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchCareers();
    }
  }, [status]);

  const fetchCareers = async () => {
    const res = await fetch('/api/careers'); // Member 4's endpoint
    const data = await res.json();
    if (data.success) setCareers(data.data.careers);
  };

  const runAnalysis = async () => {
    if (selectedCareers.length === 0) {
      alert('Please select at least one career');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/analysis/skill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerIds: selectedCareers })
      });

      const data = await res.json();
      if (data.success) {
        setAnalyses(data.data.analyses);
        setStage('results');
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  if (stage === 'select') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Analyze Your Skill Gap</h1>
          <p className="text-gray-600 mb-8">
            Select up to 3 careers you're interested in to see how your skills match up.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {careers.map((career) => (
              <Card
                key={career._id}
                className={`p-4 cursor-pointer transition ${
                  selectedCareers.includes(career._id) 
                    ? 'ring-2 ring-blue-600 bg-blue-50' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => {
                  if (selectedCareers.includes(career._id)) {
                    setSelectedCareers(selectedCareers.filter(id => id !== career._id));
                  } else if (selectedCareers.length < 3) {
                    setSelectedCareers([...selectedCareers, career._id]);
                  }
                }}
              >
                <h3 className="font-bold text-lg">{career.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{career.description?.slice(0, 100)}...</p>
              </Card>
            ))}
          </div>

          <Button 
            onClick={runAnalysis} 
            disabled={selectedCareers.length === 0 || loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Analyzing...' : `Analyze ${selectedCareers.length} Career(s)`}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Analysis Results</h1>
          <Button variant="outline" onClick={() => setStage('select')}>
            Analyze Different Careers
          </Button>
        </div>

        <div className="space-y-6">
          {analyses.map((analysis, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{analysis.careerName}</h2>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600">
                    {analysis.matchScore}%
                  </div>
                  <div className="text-sm text-gray-600">Match Score</div>
                </div>
              </div>

              <Progress value={analysis.matchScore} className="mb-6" />

              {/* AI Insights */}
              <div className="bg-blue-50 p-4 rounded mb-6">
                <h3 className="font-bold mb-2">AI Analysis</h3>
                <p className="text-gray-700">{analysis.aiInsights}</p>
              </div>

              {/* Skill Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-bold text-green-600 mb-2">
                    ✓ Matching Skills ({analysis.matchingSkills.length})
                  </h3>
                  <div className="space-y-1">
                    {analysis.matchingSkills.map((skill: any, i: number) => (
                      <Badge key={i} variant="outline" className="mr-1">
                        {skill.skillName}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-yellow-600 mb-2">
                    ⚠ Skills to Improve ({analysis.partialSkills.length})
                  </h3>
                  <div className="space-y-1">
                    {analysis.partialSkills.map((skill: any, i: number) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium">{skill.skillName}:</span> {skill.gap}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-red-600 mb-2">
                    ✗ Missing Skills ({analysis.missingSkills.length})
                  </h3>
                  <div className="space-y-1">
                    {analysis.missingSkills.map((skill: any, i: number) => (
                      <Badge key={i} variant="destructive" className="mr-1">
                        {skill.skillName}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                className="w-full mt-6"
                onClick={() => router.push(`/recommendations?career=${analysis.careerId}`)}
              >
                Get Learning Path →
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### 5. Testing & Integration (1 hour)

**Test Checklist**:
- [ ] Analysis runs with selected careers
- [ ] Match scores are calculated correctly
- [ ] AI insights are generated
- [ ] Skills are categorized (matching/partial/missing)
- [ ] Results page displays all data
- [ ] Analysis is saved to database

**Integration Points**:
- Consumes user skills from Member 2
- Consumes career data from Member 4
- Provides analysis results to Member 4 (for learning paths)

---

## 🧑‍💻 Member 4: Career Recommendations & Learning Paths

### 🎯 Feature Overview
Build the career database, generate AI-powered career recommendations, and create personalized learning paths with course suggestions for missing skills.

### 📋 Tasks Breakdown

#### 1. Database Models (2 hours)

**File**: `src/lib/db/models/Career.ts`

```typescript
import mongoose from 'mongoose';

const CareerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  alternativeTitles: [String],
  industryId: String,
  description: String,
  responsibilities: [String],
  salaryData: {
    currency: { type: String, default: 'USD' },
    entryLevel: { min: Number, max: Number },
    midLevel: { min: Number, max: Number },
    seniorLevel: { min: Number, max: Number }
  },
  growthOutlook: {
    type: String,
    enum: ['Declining', 'Stable', 'Growing', 'High Growth']
  },
  demandScore: Number, // 0-100
  createdAt: { type: Date, default: Date.now }
});

export const Career = mongoose.models.Career || 
  mongoose.model('Career', CareerSchema);
```

**File**: `src/lib/db/models/LearningResource.ts`

```typescript
import mongoose from 'mongoose';

const LearningResourceSchema = new mongoose.Schema({
  skillId: mongoose.Schema.Types.ObjectId,
  skillName: String,
  title: String,
  provider: {
    type: String,
    enum: ['Coursera', 'Udemy', 'YouTube', 'freeCodeCamp', 'edX', 'LinkedIn Learning']
  },
  url: String,
  type: {
    type: String,
    enum: ['Course', 'Video', 'Tutorial', 'Article', 'Book']
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  duration: String, // "4 weeks", "10 hours"
  cost: {
    isFree: Boolean,
    amount: Number
  },
  rating: Number, // 0-5
  reviewCount: Number
});

export const LearningResource = mongoose.models.LearningResource || 
  mongoose.model('LearningResource', LearningResourceSchema);
```

**Seed Data**: Create `seeds/careers.ts` with 20+ careers and `seeds/resources.ts` with 100+ learning resources.

#### 2. API Routes (4 hours)

**File**: `src/app/api/careers/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Career } from '@/lib/db/models/Career';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const industry = searchParams.get('industry');
    
    const query = industry ? { industryId: industry } : {};
    
    const careers = await Career.find(query)
      .sort({ demandScore: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      data: { careers }
    });

  } catch (error) {
    console.error('Careers fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
```

**File**: `src/app/api/recommendations/careers/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { Career } from '@/lib/db/models/Career';
import { CareerSkill } from '@/lib/db/models/CareerSkill';
import { openrouter, AI_MODELS } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Fetch user data
    const userSkillsDoc = await UserSkill.findOne({ userId: session.user.id });
    if (!userSkillsDoc) {
      return NextResponse.json({
        success: false,
        error: 'No skills found. Please add skills first.'
      }, { status: 400 });
    }

    const userSkills = userSkillsDoc.skills.map((s: any) => s.skillName);
    const interests = userSkillsDoc.interests;

    // Fetch all careers with their required skills
    const allCareers = await Career.find().limit(50);
    const careerSkills = await CareerSkill.find();

    // Calculate match scores for all careers
    const careerMatches = allCareers.map(career => {
      const skillsDoc = careerSkills.find(cs => cs.careerId.toString() === career._id.toString());
      if (!skillsDoc) return null;

      const requiredSkills = skillsDoc.requiredSkills.map((s: any) => s.skillName);
      const matchingSkills = userSkills.filter((s: string) => requiredSkills.includes(s));
      const matchScore = (matchingSkills.length / requiredSkills.length) * 100;

      return {
        career,
        matchScore: Math.round(matchScore),
        matchingSkills,
        missingSkills: requiredSkills.filter((s: string) => !userSkills.includes(s))
      };
    }).filter(Boolean);

    // Sort by match score and get top 5
    const topMatches = careerMatches
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, 5);

    // Generate AI reasoning for top matches
    const recommendations = await Promise.all(
      topMatches.map(async (match: any) => {
        const reasoning = await generateCareerReasoning(
          match.career.title,
          userSkills,
          interests,
          match.matchScore
        );

        return {
          careerId: match.career._id,
          careerName: match.career.title,
          description: match.career.description,
          matchScore: match.matchScore,
          salaryRange: match.career.salaryData?.entryLevel || null,
          growthOutlook: match.career.growthOutlook,
          matchingSkills: match.matchingSkills.slice(0, 3),
          missingSkills: match.missingSkills.slice(0, 3),
          reasoning
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: { recommendations }
    });

  } catch (error) {
    console.error('Career recommendation error:', error);
    return NextResponse.json({ success: false, error: 'Recommendation failed' }, { status: 500 });
  }
}

async function generateCareerReasoning(
  careerName: string,
  userSkills: string[],
  interests: string[],
  matchScore: number
): Promise<string> {
  const prompt = `
You are a career advisor. Explain in 2-3 sentences why "${careerName}" is a good match for someone with:
- Skills: ${userSkills.join(', ')}
- Interests: ${interests.join(', ')}
- Match Score: ${matchScore}%

Be encouraging and specific about skill alignment.
`;

  try {
    const response = await openrouter.chat.completions.create({
      model: AI_MODELS.primary,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 150
    });

    return response.choices[0].message.content || "Great career match based on your skills!";
  } catch (error) {
    return "This career aligns well with your current skill set.";
  }
}
```

**File**: `src/app/api/recommendations/learning-paths/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { LearningResource } from '@/lib/db/models/LearningResource';
import { openrouter, AI_MODELS } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { missingSkills } = await req.json();

    if (!missingSkills || missingSkills.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No missing skills provided'
      }, { status: 400 });
    }

    await connectDB();

    // Fetch learning resources for missing skills
    const learningPaths = await Promise.all(
      missingSkills.map(async (skill: string) => {
        const resources = await LearningResource.find({ 
          skillName: skill 
        })
        .sort({ rating: -1, reviewCount: -1 })
        .limit(5);

        // Generate AI learning strategy
        const strategy = await generateLearningStrategy(skill);

        return {
          skill,
          strategy,
          resources: resources.map(r => ({
            title: r.title,
            provider: r.provider,
            url: r.url,
            type: r.type,
            difficulty: r.difficulty,
            duration: r.duration,
            isFree: r.cost.isFree,
            rating: r.rating
          }))
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: { learningPaths }
    });

  } catch (error) {
    console.error('Learning path error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate learning paths' }, { status: 500 });
  }
}

async function generateLearningStrategy(skill: string): Promise<string> {
  const prompt = `
You are a learning advisor. For someone who wants to learn "${skill}", provide:
1. Recommended learning order (1-2 sentences)
2. Estimated time to reach job-ready level
3. One key tip for mastering this skill

Keep it concise (3-4 sentences total).
`;

  try {
    const response = await openrouter.chat.completions.create({
      model: AI_MODELS.primary,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200
    });

    return response.choices[0].message.content || "Start with fundamentals and practice regularly.";
  } catch (error) {
    return `Focus on building strong fundamentals in ${skill} through hands-on projects.`;
  }
}
```

#### 3. UI Components (5 hours)

**File**: `src/app/recommendations/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function RecommendationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<any>(null);
  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<'recommendations' | 'learning'>('recommendations');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchRecommendations();
    }
  }, [status]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recommendations/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (data.success) {
        setRecommendations(data.data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLearningPath = async (career: any) => {
    setSelectedCareer(career);
    setLoading(true);
    
    try {
      const res = await fetch('/api/recommendations/learning-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missingSkills: career.missingSkills })
      });

      const data = await res.json();
      if (data.success) {
        setLearningPaths(data.data.learningPaths);
        setStage('learning');
      }
    } catch (error) {
      alert('Error generating learning path');
    } finally {
      setLoading(false);
    }
  };

  if (loading && recommendations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div>Analyzing careers and generating recommendations...</div>
        </div>
      </div>
    );
  }

  if (stage === 'recommendations') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Career Recommendations</h1>
          <p className="text-gray-600 mb-8">
            Based on your skills and interests, here are the best career matches for you.
          </p>

          <div className="space-y-6">
            {recommendations.map((rec, idx) => (
              <Card key={idx} className="p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{rec.careerName}</h2>
                      <Badge variant="outline" className="text-lg">
                        {rec.matchScore}% Match
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{rec.description}</p>
                    
                    {/* AI Reasoning */}
                    <div className="bg-blue-50 p-3 rounded mb-4">
                      <p className="text-sm text-gray-700">{rec.reasoning}</p>
                    </div>

                    {/* Salary & Growth */}
                    <div className="flex gap-6 text-sm mb-4">
                      {rec.salaryRange && (
                        <div>
                          <span className="text-gray-600">Entry Salary:</span>
                          <span className="font-medium ml-2">
                            ${rec.salaryRange.min?.toLocaleString()} - ${rec.salaryRange.max?.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {rec.growthOutlook && (
                        <div>
                          <span className="text-gray-600">Growth:</span>
                          <Badge 
                            className="ml-2"
                            variant={rec.growthOutlook === 'High Growth' ? 'default' : 'outline'}
                          >
                            {rec.growthOutlook}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-6">
                    <Progress value={rec.matchScore} className="w-24 mb-2" />
                  </div>
                </div>

                {/* Skills Breakdown */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-green-600 text-sm mb-2">
                      ✓ Your Matching Skills
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {rec.matchingSkills?.map((skill: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-red-600 text-sm mb-2">
                      ✗ Skills to Learn
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {rec.missingSkills?.map((skill: string, i: number) => (
                        <Badge key={i} variant="destructive" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => getLearningPath(rec)}
                  disabled={rec.missingSkills?.length === 0}
                >
                  {rec.missingSkills?.length === 0 
                    ? 'You\'re Ready!' 
                    : 'Get Personalized Learning Path →'
                  }
                </Button>
              </Card>
            ))}
          </div>

          {recommendations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No recommendations yet.</p>
              <Button onClick={() => router.push('/dashboard')}>
                Add Skills to Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Learning Path Stage
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Your Learning Path</h1>
            <p className="text-gray-600 mt-2">
              For: <span className="font-semibold">{selectedCareer?.careerName}</span>
            </p>
          </div>
          <Button variant="outline" onClick={() => setStage('recommendations')}>
            ← Back to Recommendations
          </Button>
        </div>

        <div className="space-y-8">
          {learningPaths.map((path, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{path.skill}</h2>
                  
                  {/* AI Learning Strategy */}
                  <div className="bg-blue-50 p-4 rounded mb-4">
                    <h3 className="font-bold text-sm mb-2">📚 Learning Strategy</h3>
                    <p className="text-gray-700">{path.strategy}</p>
                  </div>

                  {/* Learning Resources */}
                  <h3 className="font-bold mb-3">Recommended Resources</h3>
                  <div className="space-y-3">
                    {path.resources.map((resource: any, rIdx: number) => (
                      <div key={rIdx} className="flex items-center justify-between p-3 bg-white border rounded hover:shadow transition">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{resource.title}</h4>
                            {resource.isFree && (
                              <Badge variant="outline" className="text-xs">FREE</Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {resource.difficulty}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {resource.provider} • {resource.type} • {resource.duration}
                            {resource.rating && ` • ⭐ ${resource.rating}/5`}
                          </div>
                        </div>
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Button size="sm">Start →</Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 mt-8 bg-green-50 border-green-200">
          <h3 className="font-bold text-lg mb-2">🎯 Next Steps</h3>
          <ul className="space-y-2 text-gray-700">
            <li>1. Start with the first skill and complete at least one beginner course</li>
            <li>2. Build a project to practice each skill as you learn</li>
            <li>3. Track your progress in your profile</li>
            <li>4. Re-analyze your skill gap every month to see improvement</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
```

#### 4. Testing & Integration (1 hour)

**Test Checklist**:
- [ ] Career recommendations are generated
- [ ] AI reasoning makes sense
- [ ] Learning resources are fetched correctly
- [ ] Learning paths are personalized
- [ ] External resource links work
- [ ] UI handles empty states

**Integration Points**:
- Provides career data to Member 3 (for analysis)
- Consumes analysis results from Member 3
- Uses skill data from Member 2

---

## 🔗 Integration & Coordination

### Shared Database Connection
**File**: `src/lib/db/connection.ts` (Created by Member 1, used by all)

All members import and use:
```typescript
import { connectDB } from '@/lib/db/connection';
```

### Shared TypeScript Types
**File**: `src/types/index.ts`

```typescript
export interface User {
  _id: string;
  email: string;
  profile: {
    name: string;
    education?: {
      level: string;
      institution: string;
    };
  };
}

export interface Skill {
  skillId: string;
  skillName: string;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  proficiencyScore: number;
}

export interface Career {
  _id: string;
  title: string;
  description: string;
  salaryData?: {
    entryLevel: { min: number; max: number };
  };
  growthOutlook: string;
}

export interface Analysis {
  matchScore: number;
  matchingSkills: Skill[];
  missingSkills: Skill[];
  partialSkills: Skill[];
  aiInsights: string;
}
```

### Navigation Flow Between Features

```
Login/Register (M1) 
    ↓
Dashboard (M2) → Add Skills → Interests
    ↓
Analysis (M3) → Select Careers → Run Analysis
    ↓
Recommendations (M4) → View Matches → Get Learning Path
```

### Shared UI Components (Using shadcn/ui)

All members should install and use:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input badge progress select
```

---

## 📅 Development Timeline (3-Day Sprint)

### Day 1: Foundation (8 hours each)
- **Member 1**: Complete auth system + deployment setup
- **Member 2**: Build profile UI + skill management
- **Member 3**: Set up AI service + analysis logic
- **Member 4**: Seed career database + basic API

**End of Day 1 Integration**: Members 1 & 2 integrate so users can register and add skills.

### Day 2: Core Features (8 hours each)
- **Member 1**: Testing, bug fixes, help others
- **Member 2**: Complete skills UI + API integration
- **Member 3**: Build analysis UI + integrate with AI
- **Member 4**: Complete recommendations UI

**End of Day 2 Integration**: Full flow from login → skills → analysis works.

### Day 3: Polish & Integration (8 hours each)
- **All Members**: 
  - Integration testing
  - Bug fixes
  - UI polish
  - Presentation preparation
  - Deploy to Vercel

---

## 🚀 Deployment Checklist

### Environment Variables (.env.local)
```bash
# Member 1
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Member 3 & 4
OPENROUTER_API_KEY=your-openrouter-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel Deployment (Assigned to Member 1)
1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy
5. Share URL with team

---

## 🎯 Success Criteria

- [ ] Users can register and login
- [ ] Users can add 5+ skills with proficiency levels
- [ ] Analysis generates match scores for selected careers
- [ ] AI insights are meaningful and helpful
- [ ] Learning paths show relevant resources
- [ ] All pages are responsive (mobile + desktop)
- [ ] No critical bugs during demo
- [ ] Demo shows complete user journey (2-3 minutes)

---

## 💡 Communication Protocol

### Daily Standup (15 minutes)
- What did you complete yesterday?
- What are you working on today?
- Any blockers?

### Integration Points Meeting (30 minutes each day)
- Test data flows between features
- Resolve API contract mismatches
- Fix bugs together

### Slack/Discord Channels
- `#general` - General updates
- `#auth` - Member 1 questions
- `#profile` - Member 2 questions
- `#analysis` - Member 3 questions
- `#recommendations` - Member 4 questions
- `#integration` - Cross-feature issues

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB Connection Errors
**Solution**: Ensure all members use the shared connection pool from `src/lib/db/connection.ts`

### Issue: NextAuth Session Not Available
**Solution**: Wrap app with `SessionProvider` in `app/layout.tsx`:
```typescript
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

### Issue: CORS Errors with OpenRouter
**Solution**: Ensure `NEXT_PUBLIC_APP_URL` is set correctly and use server-side API routes (not client-side)

### Issue: Slow AI Responses
**Solution**: Add loading states, use `temperature: 0.3` for faster responses, consider caching results

---

## 📊 Demo Script (3 minutes)

1. **Registration** (30s): Show sign-up flow
2. **Profile Setup** (45s): Add 5 skills with different proficiency levels + interests
3. **Analysis** (60s): Select 2-3 careers, run analysis, show match scores and gaps
4. **Recommendations** (45s): Show top career matches with AI reasoning, open learning path for one career

**Backup Demo**: If live demo fails, have a recorded video ready.

---

## 🎉 Good Luck! 