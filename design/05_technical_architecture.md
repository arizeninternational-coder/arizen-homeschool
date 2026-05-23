# SECTION 5 — TECHNICAL ARCHITECTURE

## Frontend

### Framework
- **Next.js 13+ (App Router)** - Uses the new app directory structure for React Server Components, streaming, and parallel routes.

### Component Structure & Folder Naming Conventions
```
src/
├── app/                    # Next.js App Router
│   ├── (guild)/            # Route group for guild (school/hub) scope
│   │   ├── layout.tsx      # Guild layout (sidebar, nav)
│   │   ├── page.tsx        # Guild dashboard
│   │   ├── [themeSlug]/    # Dynamic theme route
│   │   │   ├── layout.tsx  # Theme layout
│   │   │   ├── page.tsx    # Theme overview
│   │   │   └── [questSlug]/ # Dynamic quest route
│   │   │       ├── layout.tsx # Quest layout
│   │   │       ├── page.tsx   # Quest overview
│   │   │       └── [lessonSlug]/ # Dynamic lesson route
│   │   │           ├── layout.tsx # Lesson layout
│   │   │           └── page.tsx   # Lesson player
│   │   └── ...             # Other guild routes (profile, admin, etc.)
│   ├── api/                # Next.js API routes (REST)
│   └── ...                 # Other root routes (auth, etc.)
├── components/             # Reusable UI components
│   ├── ui/                 # Shadcn/ui or custom primitive components
│   ├── layout/             # Layout components (header, footer, sidebar)
│   ├── content/            # Content block renderers (text, video, quiz, etc.)
│   ├── quest/              # Quest-specific components
│   ├── lesson/             # Lesson-specific components
│   └── ...                 # Other feature-based components
├── lib/                    # Utilities, helpers, custom hooks
│   ├── api/                # API client functions
│   ├── auth/               # Auth helpers
│   ├── db/                 # Database utilities (if using Prisma client directly)
│   ├── zustand/            # Zustand store slices
│   └── ...                 # Other utilities
├── stores/                 # Zustand store definitions
│   ├── index.ts            # Root store (combines slices)
│   ├── guildStore.ts       # Guild-related state
│   ├── themeStore.ts       # Theme-related state
│   ├── questStore.ts       # Quest-related state
│   ├── lessonStore.ts      # Lesson-related state
│   ├── learnerProfileStore.ts # Learner profile and progress
│   ├── uiStore.ts          # UI state (sidebar, modals, etc.)
│   └── ...                 # Other stores
├── styles/                 # Global styles, CSS modules, or Tailwind config
├── public/                 # Static assets
└── ...                     # Config files (next.config.js, etc.)
```

**Naming Conventions:**
- Use `kebab-case` for file and folder names.
- Component files: `PascalCase.tsx` (e.g., `VideoPlayer.tsx`).
- Custom hooks: `useHookName.ts`.
- Utility functions: `camelCase`.
- Constants: `UPPER_SNAKE_CASE`.

### State Management
- **Zustand** - Centralized state management with slices for different domains.
  - Stores are created in `src/stores/` and combined in `src/stores/index.ts`.
  - Middleware for persistence (localStorage) can be added for certain UI state.
  - Server state (data from API) is primarily handled by React Query or SWR (if needed) but can also be managed in Zustand for client-side caching.

### Routing
- **Hierarchical Routing**: `guild → theme → quest → lesson`
  - Implemented via dynamic route segments in the App Router.
  - Layouts at each level provide shared UI (e.g., theme layout includes theme-specific styling and navigation).
  - Route groups `(guild)` allow for organizing routes without affecting the URL path.

### Mobile-First, Responsive
- **CSS Framework**: Tailwind CSS for utility-first, responsive design.
- **Breakpoints**: Follow mobile-first approach (min-width).
- **Components**: Built to be responsive by default (flexible grids, images, etc.).
- **Testing**: Regular testing on various device sizes using browser dev tools.

### Offline-First Foundations
- **Service Workers**: Use `next-offline` or custom service worker via `next-pwa` for caching static assets and API responses.
- **Local Caching**: 
  - Use IndexedDB via libraries like `idb` or `localForage` for storing lesson content, progress, and user-generated data.
  - Zustand persistence middleware can sync certain stores to localStorage/IndexedDB.
  - Implement background sync for sending data when online.
- **API Routes**: Design API endpoints to be idempotent and support offline queueing.

## Backend

### Runtime
- **Node.js** (via Next.js) - The backend is implemented as Next.js API routes, running in a Node.js environment.

### Local Database
- **SQLite** - Used during development via Prisma ORM.
- **Prisma ORM** - For type-safe database access and migrations.
  - Schema defined in `prisma/schema.prisma`.
  - Migrations managed with `prisma migrate`.
  - In production (later migration to Supabase), the same Prisma schema will point to PostgreSQL.

### Authentication
- **NextAuth.js** - For authentication.
  - Currently configured with **Credentials Provider** (local username/password).
  - Session stored in JWT (for simplicity) or database.
  - Future: Add OAuth providers (Google, etc.) as needed.

### REST API
- **Next.js API Routes** - Located in `src/app/api/`.
  - Follow REST conventions where appropriate.
  - Example endpoints:
    - `GET /api/guilds/[guildId]/themes` - List themes for a guild
    - `GET /api/themes/[themeId]/quests` - List quests for a theme
    - `GET /api/quests/[questId]/lessons` - List lessons for a quest
    - `GET /api/lessons/[lessonId]` - Get a single lesson
    - `POST /api/progress` - Update learner progress
    - `POST /api/xp` - Award XP
  - All API routes are protected by authentication middleware (via NextAuth).

## Database Schema

### Design Principles
- Designed to be **identical** for SQLite (dev) and PostgreSQL (Supabase prod).
- Uses Prisma data model which is database-agnostic for the defined features.
- Avoids database-specific features (e.g., SQLite's lack of foreign key enforcement is handled by Prisma in dev, but we enable foreign keys in SQLite via PRAGMA).

### Prisma Schema (`prisma/schema.prisma`)
```prisma
// This is the conceptual schema; the actual file will be created by the developer.
// We describe the tables and relations here.

/// Guild (School/Hub) - represents Arizen Homeschool Hub or a specific school
model Guild {
  id            String   @id @default(uuid())
  name          String
  slug          String   @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  // Relations
  themes        Theme[]
  learnerProfiles LearnerProfile[] // Profiles belonging to this guild
}

/// Learner Profile - extends User with learning-specific data
model LearnerProfile {
  id            String   @id @default(uuid())
  userId        String   @unique // FK to User (via relation)
  guildId       String   // FK to Guild
  grade         Int      // Current grade (e.g., 5)
  dateOfBirth   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  // Relations
  user          User     @relation(fields: [userId], references: [id])
  guild         Guild    @relation(fields: [guildId], references: [id])
  progress      Progress[]
  xpRecords     XpRecord[]
  badges        Badge[]
  streaks       Streak[]
}

/// User - Authentication user (from NextAuth)
model User {
  id            String   @id @default(uuid()) // Typically the NextAuth user ID
  name          String?
  email         String?  @unique
  emailVerified DateTime?
  image         String?
  // Note: NextAuth manages its own tables for sessions, etc. We link via id.
  learnerProfile LearnerProfile? // One-to-one (optional, for learners; parents may not have)
  // Relations
  progress      Progress[]
  xpRecords     XpRecord[]
  badges        Badge[]
  streaks       Streak[]
}

/// Theme
model Theme {
  id            String   @id @default(uuid())
  guildId       String   // FK to Guild
  title         String
  slug          String   @unique
  description   String?
  coverImage    String?  // URL to image
  durationWeeks Int
  drivingQuestion String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  // Relations
  guild         Guild    @relation(fields: [guildId], references: [id])
  quests        Quest[]
  // Denormalized for quick access (optional, can be computed)
  // subjects        String[]   // List of subjects covered (from quests/lessons)
}

/// Quest
model Quest {
  id            String   @id @default(uuid())
  themeId       String   // FK to Theme
  title         String
  description   String?
  questType     QuestType // ENUM: MAIN, SIDE, CHALLENGE
  orderIndex    Int
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  // Relations
  theme         Theme    @relation(fields: [themeId], references: [id])
  lessons       Lesson[]
  sideQuests    SideQuest[] // Quests can contain side quests
  // Denormalized (optional)
  // subjects        String[]
}

/// Lesson
model Lesson {
  id            String   @id @default(uuid())
  questId       String   // FK to Quest
  title         String
  description   String?
  contentBlocks Json     // Stores the array of content block objects (from schema)
  cbcMapping    Json     // Stores the CBC mapping object
  difficulty    Json     // Stores difficulty object
  xpReward      Json     // Stores XP reward object
  estimatedDurationMinutes Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  // Relations
  quest         Quest    @relation(fields: [questId], references: [id])
  progress      Progress[]
  // Note: Activities (experiments, projects) are separate but can be linked via Activity table
}

/// Activity (Experiment, Project, etc.) - Reusable across lessons, quests, side quests
model Activity {
  id            String   @id @default(uuid())
  // Polymorphic relation: can be linked to Lesson, Quest, SideQuest, or stand-alone (theme)
  lessonId      String?  // Optional FK to Lesson
  questId       String?  // Optional FK to Quest
  sideQuestId   String?  // Optional FK to SideQuest
  themeId       String   // FK to Theme (always required for scoping)
  title         String
  description   String?
  activityType  ActivityType // ENUM: EXPERIMENT, PROJECT, BUILD, MODEL, COOKING, FIELDSTUDY, SURVEY
  materialsList Json     // Array of material objects
  toolsList     Json     // Array of tool objects
  procedureSteps Json    // Array of step objects
  estimatedDurationMinutes Int?
  difficulty    Json     // Difficulty object
  cbcMapping    Json     // CBC mapping
  xpReward      Json     // XP reward
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  // Relations
  lesson        Lesson?    @relation(fields: [lessonId], references: [id])
  quest         Quest?     @relation(fields: [questId], references: [id])
  sideQuest     SideQuest? @relation(fields: [sideQuestId], references: [id])
  theme         Theme      @relation(fields: [themeId], references: [id])
  progress      Progress[] // Learner progress on this activity
}

/// SideQuest - Similar to Quest but optional
model SideQuest {
  id            String   @id @default(uuid())
  questId       String?  // Optional FK to Quest (if nested) or null if directly under theme
  themeId       String   // FK to Theme
  title         String
  description   String?
  sideQuestType SideQuestType // ENUM: EXPERIMENT, JOURNALING, REALWORLDTASK, etc.
  activityBlocks Json     // Similar to Lesson.contentBlocks but for activities
  cbcMapping    Json
  difficulty    Json
  estimatedDurationMinutes Int?
  xpReward      Json
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  // Relations
  quest         Quest?     @relation(fields: [questId], references: [id])
  theme         Theme      @relation(fields: [themeId], references: [id])
  progress      Progress[]
}

/// Progress / Mastery State
model Progress {
  id            String   @id @default(uuid())
  learnerId     String   // FK to LearnerProfile (or User if we want to allow non-linked users)
  // Polymorphic: what progress is being tracked
  lessonId      String?
  questId       String?
  sideQuestId   String?
  activityId    String?
  masteryPercent Int      // 0-100
  lastAccessed  DateTime @default(now())
  completedAt   DateTime?
  // Relations
  learner       LearnerProfile @relation(fields: [learnerId], references: [id])
  lesson        Lesson?    @relation(fields: [lessonId], references: [id])
  quest         Quest?     @relation(fields: [questId], references: [id])
  sideQuest     SideQuest? @relation(fields: [sideQuestId], references: [id])
  activity      Activity?  @relation(fields: [activityId], references: [id])
}

/// XP Records
model XpRecord {
  id            String   @id @default(uuid())
  learnerId     String   // FK to LearnerProfile
  sourceType    XpSourceType // ENUM: LESSON, QUEST, SIDEQUEST, ACTIVITY, REFLECTION, STREAK, etc.
  sourceId      String   // ID of the source (lessonId, questId, etc.)
  amount        Int      // XP awarded
  awardedAt     DateTime @default(now())
  // Relations
  learner       LearnerProfile @relation(fields: [learnerId], references: [id])
}

/// Badges
model Badge {
  id            String   @id @default(uuid())
  learnerId     String   // FK to LearnerProfile
  badgeType     String   // e.g., "water_explorer", "young_scientist"
  name          String   // Display name
  description   String?
  imageUrl      String?  // URL to badge icon
  awardedAt     DateTime @default(now())
  // Relations
  learner       LearnerProfile @relation(fields: [learnerId], references: [id])
}

/// Streaks
model Streak {
  id            String   @id @default(uuid())
  learnerId     String   // FK to LearnerProfile
  streakType    String   // e.g., "daily_reflection", "measurement"
  currentCount  Int
  lastDate      DateTime // Last date the streak was incremented
  bestCount     Int
  // Relations
  learner       LearnerProfile @relation(fields: [learnerId], references: [id])
}

/// CBC Reference Data (Strands, Competencies, Values, PCIs)
/// These are typically static and can be seeded.
model CbcStrand {
  id            String   @id @default(uuid())
  subject       String   // e.g., "Mathematics"
  name          String   // e.g., "Numbers"
  // Unique together
  @@unique([subject, name])
}

model CbcCompetency {
  id            String   @id @default(uuid())
  name          String   @unique // e.g., "critical_thinking"
  description   String?
}

model CbcValue {
  id            String   @id @default(uuid())
  name          String   @unique // e.g., "responsibility"
  description   String?
}

model CbcPci {
  id            String   @id @default(uuid())
  name          String   @unique // e.g., "environmental_education"
  description   String?
}

// Enums
enum QuestType {
  MAIN
  SIDE
  CHALLENGE
}

enum ActivityType {
  EXPERIMENT
  PROJECT
  BUILD
  MODEL
  COOKING
  FIELDSTUDY
  SURVEY
}

enum SideQuestType {
  EXPERIMENT
  JOURNALING
  REALWORLDTASK
  DRAWING
  BUILDING
  INTERVIEW
  FIELDTRIP
  GAME
  PUZZLE
}

enum XpSourceType {
  LESSON
  QUEST
  SIDEQUEST
  ACTIVITY
  REFLECTION
  STREAK
  BONUS
}
```

### Mermaid ER Diagram
```mermaid
erDiagram
    GUILD ||..o THEME : "has"
    GUILD ||..o LEARNER_PROFILE : "has"
    USER ||..o LEARNER_PROFILE : "has one"
    USER ||..o PROGRESS : "has"
    USER ||..o XP_RECORD : "has"
    USER ||..o BADGE : "has"
    USER ||..o STREAK : "has"
    LEARNER_PROFILE ||..o PROGRESS : "has"
    LEARNER_PROFILE ||..o XP_RECORD : "has"
    LEARNER_PROFILE ||..o BADGE : "has"
    LEARNER_PROFILE ||..o STREAK : "has"
    THEME ||..o QUEST : "has"
    THEME ||..o SIDE_QUEST : "has"
    THEME ||..o LESSON : "has" // Via Quest or direct? We'll show via Quest for lessons, but note activities can be direct
    THEME ||..o ACTIVITY : "has" // Stand-alone activities
    QUEST ||..o LESSON : "has"
    QUEST ||..o SIDE_QUEST : "has" // Nested side quests
    QUEST ||..o PROGRESS : "has"
    SIDE_QUEST ||..o PROGRESS : "has"
    LESSON ||..o PROGRESS : "has"
    ACTIVITY ||..o PROGRESS : "has"
    LESSON ||..o ACTIVITY : "has" // Activities can be part of a lesson (optional link)
    CBC_STRAND ||..o{ LESSON : "maps to" // Via JSON mapping, but we show relation
    CBC_COMPETENCY ||..o{ LESSON : "maps to"
    CBC_VALUE ||..o{ LESSON : "maps to"
    CBC_PCI ||..o{ LESSON : "maps to"
    // Similar for Quest, SideQuest, Activity (omitted for clarity, but same pattern)
```

### Migration to Supabase (PostgreSQL)
- **Zero Structural Changes**: The Prisma schema uses only features supported by both SQLite and PostgreSQL.
  - Relations: `@relation` works in both.
  - JSON fields: Prisma's `Json` type maps to `JSONB` in PostgreSQL and `TEXT` (with JSON1 extension) in SQLite. We assume JSON1 is enabled in SQLite (standard in recent versions).
  - UUIDs: Prisma's `@default(uuid())` works in both.
  - Enums: Prisma enums map to `TEXT` in SQLite and `ENUM` in PostgreSQL (or `TEXT` if we prefer consistency; we can adjust the generator).
- **Steps**:
  1. In development, use SQLite: `datasource db { provider = "sqlite" url = "file:./dev.db" }`
  2. For production (Supabase), change the provider to `postgresql` and set the connection string.
  3. Run `prisma migrate deploy` against the Supabase database.
  4. No changes to the data model are needed.

## Content Storage

### Development (Local File System)
- **Media Assets**: Images, videos, audio files stored in `public/media/` (or `src/media/` and copied to public via build step).
  - Organized by type: `public/media/images/`, `public/media/videos/`, etc.
  - Referenced in content blocks by relative path (e.g., `/media/images/water_cycle.png`).
- **Content Payloads**: 
  - Lesson content blocks, quest descriptions, etc., are stored as JSON in the database (see `contentBlocks` JSON field in Lesson, etc.).
  - During development, we may also store static JSON files in `src/content/` for seeding, but the source of truth is the database.

### Production Considerations
- For scaling, media assets can be moved to a CDN or cloud storage (e.g., Supabase Storage, AWS S3).
  - The content block schema would then store a full URL or cloud storage path.
  - The application remains agnostic via a configuration setting for the base media URL.

## Dynamic Renderer

### Purpose
- A single React component that can render any content block type defined in the Content Engine Schemas (Section 4).

### Implementation
- **File**: `src/components/content/ContentRenderer.tsx`
- **Props**: 
  - `block`: The content block object (from `contentBlocks` array).
  - `context`: Optional context (e.g., learner ID, theme ID) for AI features or personalization.
- **Logic**:
  ```tsx
  import { TextBlock } from './TextBlock';
  import { VideoBlock } from './VideoBlock';
  import { QuizBlock } from './QuizBlock';
  import { InteractiveBlock } from './InteractiveBlock';
  import { JournalBlock } from './JournalBlock';
  import { ExperimentBlock } from './ExperimentBlock';
  // ... other block types

  const ContentRenderer = ({ block, context }) => {
    switch (block.type) {
      case 'text':
        return <TextBlock block={block} context={context} />;
      case 'video':
        return <VideoBlock block={block} context={context} />;
      case 'quiz':
        return <QuizBlock block={block} context={context} />;
      case 'interactive':
        return <InteractiveBlock block={block} context={context} />;
      case 'journal':
        return <JournalBlock block={block} context={context} />;
      case 'experiment':
        return <ExperimentBlock block={block} context={context} />;
      // Add cases for other types as they are defined
      default:
        return <div>Unsupported block type: {block.type}</div>;
    }
  };
  export default ContentRenderer;
  ```
- **Each Block Component**:
  - Responsible for rendering its specific type.
  - Can use interactivity (e.g., quiz uses state for answers).
  - Can call AI services (e.g., hint engine) if needed and permitted by context.

### Supported Block Types (from 04_content_engine_schemas.md)
- `text`
- `video`
- `audio`
- `image`
- `interactive` (e.g., configurable quiz, simulation)
- `journal` (prompt for reflection)
- `experiment` (procedure steps, materials list)
- (Note: The schema also mentions `checklist`, `timer` in activity blocks; these can be treated as interactive or specific subtypes.)

## CMS / Admin

### Custom Admin Panel
- Built as part of the Next.js app under a protected route (e.g., `/admin`).
- Only accessible by users with an admin role (to be implemented via a role field on User or a separate admin list).

### Content Workflow
- All content types (Theme, Quest, Lesson, Activity, SideQuest) include a `status` field.
  - Possible values: `draft`, `review`, `published`.
  - Default: `draft`.
- **Transitions**:
  - `draft` → `review`: When content is ready for feedback.
  - `review` → `published`: After approval by a curator/admin.
  - `published` → `review`: If changes are needed.
  - `review` → `discard` or `draft`: To abandon changes.
- **UI**:
  - List views show content with status badges.
  - Edit views allow changing status.
  - Published content is what is served to learners via the public API routes (which filter by `status = 'published'`).

### API Routes for Admin
- `GET /admin/api/themes` - List themes with status
- `PATCH /admin/api/themes/[id]` - Update theme (including status)
- Similar endpoints for quests, lessons, activities, side quests.

### Features
- WYSIWYG editor for text blocks (e.g., using TipTap or Slate).
- Media upload handling.
- Preview mode to see how content will render in the learner interface.
- Diff view for JSON content (optional).
- Assignment of CBC mapping (with validation against known strands/competencies/etc.).

## AI Integration Points

### 1. Content Generation Pipeline
- **Where**: During content creation in the admin panel.
- **How**:
  - Admin provides a prompt (e.g., "Generate a lesson on the water cycle for grade 5").
  - AI suggests:
    - Title, description
    - Content blocks (text, video suggestions, quiz questions)
    - CBC mapping (subject, strand, SLO, competencies, values, PCIs)
    - Difficulty estimate
    - Estimated duration
    - XP reward base
  - **Human Review**: All AI-generated content is saved as a `draft`. The admin must review, edit, and approve before changing status to `review` or `published`.
  - **Implementation**: 
    - Admin UI has a "Generate with AI" button.
    - Calls a backend API route (e.g., `/api/ai/generate-lesson`) which uses an LLM (via OpenRouter, etc.) and returns a structured proposal.
    - The proposal is then used to pre-fill the creation form.

### 2. Hint Engine
- **Where**: During learner interaction with content (lesson, quest, activity).
- **How**:
  - When a learner requests a hint (or the system detects struggle), the hint engine provides a contextual hint.
  - Uses:
    - The current content block (or activity step)
    - Learner's profile (past performance, mastery)
    - The learning objective (from CBC mapping)
  - **Output**: A text hint (or possibly a small interactive hint) that guides without giving away the answer.
  - **Human Review**: Hints are generated on-the-fly and do not go into the content database, so no review is needed. However, the hint generation logic/prompt should be reviewed by educators periodically.

### 3. Difficulty Adapter
- **Where**: In the content recommendation and sequencing engine.
- **How**:
  - Based on the learner's mastery map and zone of proximal development (from the Difficulty Scaling System in Section 4).
  - When suggesting the next lesson/quest/activity, the system:
    - Retrieves the learner's current mastery for relevant prerequisites.
    - Adjusts the difficulty of the suggested content (if the content has adjustable difficulty, e.g., via optional challenge steps).
    - Or, filters content to match the learner's ZPD.
  - **Human Review**: The adaptation rules (when to increase/decrease difficulty) are defined by educators and can be adjusted over time. The AI may suggest adjustments, but the rules are human-defined.

### AI Safety and Quality Assurance
- **Human-in-the-Loop**: All AI-generated content that becomes part of the persistent curriculum (i.e., changes the database) must pass through the review workflow (`draft` → `review` → `published`).
- **Real-Time AI Features** (hints, difficulty suggestions) are considered ephemeral and do not alter the core content. They are subject to monitoring and can be turned off or adjusted without content redeploy.
- **Data Privacy**: No learner data is sent to AI services without anonymization and consent (if required). For hint engine and difficulty adapter, we may send only non-personalized context (e.g., "learner is struggling with multiplication word problems") or use on-device models where possible.

---
This technical architecture provides a roadmap for building the Arizen Homeschool platform, leveraging modern web technologies, a solid data foundation, and thoughtful integration of AI to enhance learning while maintaining human oversight and educational integrity.