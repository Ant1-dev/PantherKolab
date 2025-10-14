# PantherKolab - FIU Student Collaboration Platform

## Project Context

Kolab is an innovative, student-centric communication and collaboration platform being built as part of the INIT Build Program at Florida International University (FIU). This is a 9-week team project designed to revolutionize how college students collaborate, study, and communicate on campus.

**Project Duration:** 9 weeks (Fall 2025)  
**Team Size:** 5-7 members with varying skill levels (from beginners to experienced developers)  
**Target Users:** FIU students, with potential campus-wide deployment

This is not just another chat app—it's a comprehensive platform that combines the best features of Discord, WhatsApp, Notion, and Canvas, specifically tailored for academic collaboration.

## Core Goals

### Primary Objectives:

1. **Real-time Communication:** Seamless text, audio, and video messaging between students
2. **Academic Collaboration:** Live whiteboards, project management, and study session coordination
3. **AI-Powered Assistance:** Conversation summaries for missed discussions and smart group suggestions
4. **Student Empowerment:** Personal branding through portfolio pages and bio sections
5. **FIU-Exclusive Access:** Email-based authentication restricted to @fiu.edu addresses only

### Success Criteria:

- ✅ All core features functional and polished
- ✅ 95%+ uptime during demo period
- ✅ Sub-2s page load times
- ✅ Zero security vulnerabilities
- ✅ Comprehensive documentation
- ✅ Each team member has significant commits and features shipped

## Features Breakdown

### Core Features (MVP - Must Have):

- **Messaging System:**

  - Real-time text messaging
  - Audio messages (voice notes)
  - Media files and document sharing
  - Group chats with role-based permissions

- **Communication:**

  - Audio calls
  - Video calls
  - Screen sharing capabilities

- **Collaboration Tools:**

  - Live virtual whiteboards for study sessions
  - Polls and voting
  - Project management (tasks, deadlines, assignments)

- **AI Features:**

  - Conversation summarization for missed messages
  - Automatic group chat suggestions based on enrolled classes
  - Smart study buddy matching

- **User Features:**
  - Personal branding (bio, portfolio page)
  - FIU email-only authentication
  - User profiles with academic information

### Stretch Features (Nice to Have):

- Campus-specific integrations (FIU Canvas, library resources)
- Location-aware features (building-based groups, study space availability)
- Academic calendar integration
- Advanced analytics and insights

## Tech Stack

### Frontend:

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (optional), custom components
- **State Management:** React Context API / Zustand (for complex state)
- **Real-time:** AWS Amplify client for AppSync subscriptions

### Backend:

- **API:** AWS AppSync (GraphQL API with built-in WebSocket support)
- **Authentication:** AWS Cognito (email/password with email verification)
- **Serverless Functions:** AWS Lambda (for business logic)
- **Real-time Infrastructure:** AppSync Subscriptions (no manual WebSocket management)

### Database & Storage:

- **Primary Database:** Amazon DynamoDB (NoSQL for fast, scalable storage)
- **File Storage:** Amazon S3 (media files, documents, audio messages, profile pictures)
- **CDN:** Amazon CloudFront (fast global content delivery)
- **Caching:** Amazon ElastiCache Redis (optional, for active conversations)

### AI & Media Processing:

- **AI/LLM:** Amazon Bedrock (Claude) or OpenAI API for conversation summaries
- **Audio/Video Calls:** Amazon Chime SDK or Agora.io
- **Media Processing:** AWS Lambda for thumbnail generation, AWS Transcribe for audio-to-text

### DevOps & Deployment:

- **Hosting:** AWS Amplify (full-stack deployment) or Vercel
- **Version Control:** Git + GitHub (public repository)
- **CI/CD:** GitHub Actions or AWS Amplify CI/CD
- **Monitoring:** Amazon CloudWatch, AWS X-Ray (distributed tracing)
- **Environment Management:** AWS Secrets Manager, .env.local files

### Development Tools:

- **Package Manager:** npm or pnpm
- **Code Quality:** ESLint, Prettier
- **Type Checking:** TypeScript strict mode
- **Testing:** Jest, React Testing Library (to be added)
- **API Testing:** Postman or AWS AppSync Console

## Project Structure

```
kolab/
├── frontend/                 # Next.js application
│   ├── app/                 # Next.js 14 App Router
│   │   ├── (auth)/         # Authentication routes
│   │   ├── (dashboard)/    # Main app routes
│   │   ├── api/            # API routes (if needed)
│   │   └── layout.tsx      # Root layout
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── chat/           # Chat-specific components
│   │   ├── whiteboard/     # Whiteboard components
│   │   └── portfolio/      # Portfolio page components
│   ├── lib/                # Utility functions
│   │   ├── amplify-config.ts
│   │   ├── graphql/        # GraphQL queries/mutations/subscriptions
│   │   └── utils.ts
│   ├── public/             # Static assets
│   └── styles/             # Global styles
├── backend/                 # AWS Lambda functions (if needed)
│   ├── resolvers/          # AppSync resolvers
│   ├── triggers/           # Cognito triggers
│   └── utils/              # Shared utilities
├── docs/                   # Documentation
│   ├── architecture.md
│   ├── api-documentation.md
│   └── setup-guide.md
├── amplify/                # AWS Amplify configuration
│   ├── backend/
│   └── team-provider-info.json
└── README.md
```

## Architecture Overview

### Data Flow for Real-time Messaging:

1. **User sends message** → Next.js client executes GraphQL mutation
2. **AppSync receives mutation** → Triggers DynamoDB resolver to store message
3. **AppSync broadcasts** → Sends update to all subscribed clients via WebSocket
4. **Clients receive update** → React components update UI automatically

### Authentication Flow:

1. **User signs up with email** → Cognito validates email format ends with @fiu.edu
2. **Verification email sent** → User receives confirmation code
3. **User confirms email** → Account activated
4. **User logs in** → JWT tokens issued to client
5. **Client authenticated** → All AppSync requests include auth headers

**Email Restriction Implementation:**

- Cognito Pre Sign-up Lambda Trigger validates email domain
- Only @fiu.edu emails allowed to create accounts
- Non-FIU emails rejected immediately with clear error message

### AI Summarization Flow:

1. **User requests summary** → Client calls Lambda function via AppSync
2. **Lambda fetches messages** → Queries DynamoDB for conversation history
3. **Lambda calls AI service** → Sends messages to Bedrock/OpenAI
4. **AI generates summary** → Returns formatted summary
5. **Summary stored & delivered** → Saved to DynamoDB, sent to client

## Important Considerations

### Security:

- **NEVER commit credentials:** Use .env.local and AWS Secrets Manager
- **Use IAM roles properly:** Least privilege access for all AWS resources
- **Validate on backend:** Never trust client-side validation alone
- **Rate limiting:** Implement to prevent abuse (API Gateway throttling)
- **Email domain restriction:** Only allow @fiu.edu email addresses (Cognito Pre Sign-up trigger)
- **Input sanitization:** Prevent XSS and injection attacks
- **HTTPS only:** Enforce secure connections

### Performance:

- **Optimize images:** Use Next.js Image component with CloudFront
- **Lazy load components:** Split code for faster initial load
- **Pagination:** Don't load entire message history at once
- **WebSocket connection management:** Handle reconnections gracefully
- **DynamoDB indexes:** Design GSIs for efficient queries
- **Code splitting:** Dynamic imports for heavy components
- **Cache strategies:** Leverage CDN and browser caching

### Scalability:

- **AppSync auto-scales:** No server management needed
- **DynamoDB on-demand:** Pay only for what you use
- **S3 + CloudFront:** Handles media delivery at any scale
- **Lambda concurrency:** Consider reserved concurrency for critical functions

### Team Collaboration:

- **Git workflow:** Feature branches → PR → Code review → Merge
- **Commit conventions:** Use conventional commits (feat:, fix:, docs:, etc.)
- **Code reviews:** Required for all PRs, focus on learning
- **Pair programming:** Schedule sessions for complex features and mentoring
- **Documentation:** Keep README, API docs, and architecture diagrams updated

### Development Workflow:

- **Local development:** Use AWS Amplify mock/sandbox for testing
- **Staging environment:** Separate AWS environment for testing
- **Feature flags:** Use for incomplete features in production
- **Rollback plan:** Keep previous deployments accessible

### Cost Management (AWS Free Tier):

- **Cognito:** 50,000 MAUs free
- **AppSync:** 250,000 query/mutation operations free
- **DynamoDB:** 25 GB storage, 25 read/write units free
- **Lambda:** 1 million requests, 400,000 GB-seconds free
- **S3:** 5 GB storage, 20,000 GET requests free

**Monitoring:** Set up AWS Budgets alerts to avoid unexpected charges!

### Testing Strategy:

- **Unit tests:** For utility functions and business logic
- **Integration tests:** For API routes and Lambda functions
- **E2E tests:** For critical user flows (auth, messaging)
- **Manual testing:** Test on real devices, different browsers

### Accessibility:

- **Keyboard navigation:** All features accessible via keyboard
- **Screen reader support:** Proper ARIA labels
- **Color contrast:** Meet WCAG 2.1 AA standards (already designed in FIU colors)
- **Alt text:** For all images and media

## Development Phases

### Phase 1: Foundation (Weeks 1-2)

- Set up development environment
- Configure AWS Amplify, Cognito, AppSync
- Basic Next.js app structure
- Authentication with FIU email restriction
- Team onboarding and skill building

### Phase 2: Core Messaging (Weeks 3-4)

- Real-time text messaging
- Group creation and management
- Message history and pagination
- Read receipts and typing indicators
- File upload to S3

### Phase 3: Rich Media & Communication (Weeks 5-6)

- Voice notes (audio messages)
- Image/video sharing
- Audio/video calls integration
- Media optimization and CDN setup

### Phase 4: Collaboration & AI (Weeks 7-8)

- Live whiteboard implementation
- Polls and voting
- Project management features
- Conversation summarization
- Smart group suggestions

### Phase 5: Polish & Demo Prep (Week 9)

- UI/UX refinements
- Performance optimization
- Security audit
- Documentation completion
- Demo preparation and rehearsal

## Key Files to Know

### Configuration Files:

- `amplify/backend/api/*/schema.graphql` - AppSync GraphQL schema
- `lib/amplify-config.ts` - Amplify client configuration
- `next.config.js` - Next.js configuration
- `.env.local` - Environment variables (NEVER commit!)
- `tailwind.config.ts` - Tailwind CSS configuration

### Entry Points:

- `app/layout.tsx` - Root layout with Amplify provider
- `app/page.tsx` - Landing/login page
- `app/(auth)/signup/page.tsx` - Registration with email validation
- `app/(auth)/login/page.tsx` - Login page
- `app/(dashboard)/layout.tsx` - Main app layout
- `app/(dashboard)/chat/page.tsx` - Main chat interface

### Core Logic:

- `lib/graphql/queries.ts` - GraphQL queries
- `lib/graphql/mutations.ts` - GraphQL mutations
- `lib/graphql/subscriptions.ts` - Real-time subscriptions
- `components/chat/MessageList.tsx` - Message rendering
- `components/chat/MessageInput.tsx` - Message sending
- `backend/triggers/preSignUp.ts` - Email domain validation Lambda

### Email Validation Lambda Example:

```typescript
// backend/triggers/preSignUp.ts
export const handler = async (event: any) => {
  const email = event.request.userAttributes.email;

  if (!email.endsWith("@fiu.edu")) {
    throw new Error(
      "Only FIU email addresses (@fiu.edu) are allowed to register."
    );
  }

  return event;
};
```

## Common Commands

```bash
# Development
npm run dev                    # Start Next.js dev server
npm run build                  # Build for production
npm run start                  # Start production server

# AWS Amplify
amplify init                   # Initialize Amplify project
amplify push                   # Deploy backend changes
amplify publish               # Deploy full-stack app
amplify mock                   # Local testing
amplify console               # Open AWS console

# Code Quality
npm run lint                   # Run ESLint
npm run format                # Run Prettier
npm run type-check            # TypeScript type checking
```

## Success Metrics (9-Week Timeline)

By the end of 9 weeks:

- ✅ All core features functional and polished
- ✅ 95%+ uptime during demo period
- ✅ Sub-2s page load times
- ✅ Zero security vulnerabilities
- ✅ Comprehensive documentation
- ✅ Each team member has significant commits and features shipped

## Resources for Team

### Learning Materials:

- Next.js 14 Documentation: https://nextjs.org/docs
- AWS Amplify Documentation: https://docs.amplify.aws
- AppSync GraphQL API: https://docs.aws.amazon.com/appsync
- Tailwind CSS: https://tailwindcss.com/docs
- TypeScript Handbook: https://www.typescriptlang.org/docs

### Inspiration:

- Discord's UI/UX patterns
- WhatsApp's simplicity
- Notion's collaboration features
- Slack's group organization

---

**Remember:** This is a learning project. Mistakes are expected and encouraged. The goal is to build something impressive while growing as developers and teammates. Ask questions, collaborate often, and celebrate small wins!
