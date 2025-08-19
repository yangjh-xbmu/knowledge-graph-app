# Development Guidelines

## Philosophy

### Core Beliefs

- **Incremental progress over big bangs** - Small changes that compile and pass tests
- **Learning from existing code** - Study and plan before implementing
- **Pragmatic over dogmatic** - Adapt to project reality
- **Clear intent over clever code** - Be boring and obvious

### Simplicity Means

- Single responsibility per function/class
- Avoid premature abstractions
- No clever tricks - choose the boring solution
- If you need to explain it, it's too complex

## Process

### 1. Planning & Staging

Break complex work into 3-5 stages. Document in `IMPLEMENTATION_PLAN.md`:

```markdown
## Stage N: [Name]
**Goal**: [Specific deliverable]
**Success Criteria**: [Testable outcomes]
**Tests**: [Specific test cases]
**Status**: [Not Started|In Progress|Complete]
```

- Update status as you progress
- Remove file when all stages are done

### 2. Implementation Flow

1. **Understand** - Study existing patterns in codebase
2. **Test** - Write test first (red)
3. **Implement** - Minimal code to pass (green)
4. **Refactor** - Clean up with tests passing
5. **Commit** - With clear message linking to plan

### 3. When Stuck (After 3 Attempts)

**CRITICAL**: Maximum 3 attempts per issue, then STOP.

1. **Document what failed**:
   - What you tried
   - Specific error messages
   - Why you think it failed

2. **Research alternatives**:
   - Find 2-3 similar implementations
   - Note different approaches used

3. **Question fundamentals**:
   - Is this the right abstraction level?
   - Can this be split into smaller problems?
   - Is there a simpler approach entirely?

4. **Try different angle**:
   - Different library/framework feature?
   - Different architectural pattern?
   - Remove abstraction instead of adding?

### 4. Self-Driven Workflow

- **Embrace Autonomous Operation**: To maximize efficiency and reduce reliance on constant user prompting, I will operate in a more autonomous, self-driven manner.
- **Utilize a Todo List**: I will create and maintain a todo list for the current set of tasks. After completing each task, I will automatically proceed to the next item on the list without waiting for a "continue" prompt.
- **Communicate Proactively**: I will provide clear updates upon completing each major task and will only pause and ask for input when faced with a genuine ambiguity, a critical decision, or a blocker. This approach replaces the inefficient "act-and-wait" pattern with a more fluid "act-and-report" workflow.

## Technical Standards

### Architecture Principles

- **Composition over inheritance** - Use dependency injection
- **Interfaces over singletons** - Enable testing and flexibility
- **Explicit over implicit** - Clear data flow and dependencies
- **Test-driven when possible** - Never disable tests, fix them

#### 分层架构模式 (Layered Architecture)

**核心思想**: 将系统按职责分层，每层只依赖下层，不跨层调用

```typescript
// 表现层 (Presentation Layer)
export class UserController {
  constructor(private userService: UserService) {}
  
  async getUser(req: Request, res: Response) {
    const user = await this.userService.findById(req.params.id);
    res.json(user);
  }
}

// 业务逻辑层 (Business Logic Layer)
export class UserService {
  constructor(private userRepository: UserRepository) {}
  
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new UserNotFoundError(id);
    return user;
  }
}

// 数据访问层 (Data Access Layer)
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return await db.users.findUnique({ where: { id } });
  }
}
```

#### 关注点分离 (Separation of Concerns)

**核心思想**: 每个模块只负责一个明确的职责

```typescript
// ❌ 违反关注点分离
class UserManager {
  async createUser(userData: any) {
    // 验证逻辑
    if (!userData.email) throw new Error('Email required');
    
    // 业务逻辑
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // 数据库操作
    const user = await db.users.create({ data: { ...userData, password: hashedPassword } });
    
    // 邮件发送
    await sendWelcomeEmail(user.email);
    
    return user;
  }
}

// ✅ 遵循关注点分离
class UserValidator {
  validate(userData: CreateUserRequest): void {
    if (!userData.email) throw new ValidationError('Email required');
  }
}

class PasswordService {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}

class UserRepository {
  async create(userData: CreateUserData): Promise<User> {
    return await db.users.create({ data: userData });
  }
}

class EmailService {
  async sendWelcomeEmail(email: string): Promise<void> {
    // 邮件发送逻辑
  }
}

class UserService {
  constructor(
    private validator: UserValidator,
    private passwordService: PasswordService,
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}
  
  async createUser(userData: CreateUserRequest): Promise<User> {
    this.validator.validate(userData);
    const hashedPassword = await this.passwordService.hash(userData.password);
    const user = await this.userRepository.create({ ...userData, password: hashedPassword });
    await this.emailService.sendWelcomeEmail(user.email);
    return user;
  }
}
```

#### 依赖注入模式 (Dependency Injection)

**核心思想**: 依赖关系由外部注入，而不是内部创建

```typescript
// ❌ 硬编码依赖
class OrderService {
  private paymentService = new PaymentService(); // 硬依赖
  private emailService = new EmailService();     // 硬依赖
  
  async processOrder(order: Order) {
    await this.paymentService.charge(order.amount);
    await this.emailService.sendConfirmation(order.customerEmail);
  }
}

// ✅ 依赖注入
interface IPaymentService {
  charge(amount: number): Promise<void>;
}

interface IEmailService {
  sendConfirmation(email: string): Promise<void>;
}

class OrderService {
  constructor(
    private paymentService: IPaymentService,
    private emailService: IEmailService
  ) {}
  
  async processOrder(order: Order) {
    await this.paymentService.charge(order.amount);
    await this.emailService.sendConfirmation(order.customerEmail);
  }
}

// 依赖注入容器配置
const container = {
  paymentService: new StripePaymentService(),
  emailService: new SendGridEmailService(),
  orderService: new OrderService(
    container.paymentService,
    container.emailService
  )
};
```

#### 配置外部化 (Configuration Externalization)

**核心思想**: 配置信息与代码分离，支持不同环境

```typescript
// config/index.ts
export interface AppConfig {
  database: {
    url: string;
    maxConnections: number;
  };
  api: {
    port: number;
    timeout: number;
  };
  features: {
    enableNewFeature: boolean;
  };
}

export const config: AppConfig = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/app',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10')
  },
  api: {
    port: parseInt(process.env.PORT || '3000'),
    timeout: parseInt(process.env.API_TIMEOUT || '30000')
  },
  features: {
    enableNewFeature: process.env.ENABLE_NEW_FEATURE === 'true'
  }
};

// services/database.ts
import { config } from '../config';

export class DatabaseService {
  constructor() {
    this.connect(config.database.url, {
      maxConnections: config.database.maxConnections
    });
  }
}
```

#### 分层错误处理 (Layered Error Handling)

**核心思想**: 不同层级处理不同类型的错误

```typescript
// 领域错误
export class DomainError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`, 'USER_NOT_FOUND');
  }
}

// 应用层错误处理
export class UserService {
  async findById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new UserNotFoundError(id);
      }
      return user;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error; // 重新抛出领域错误
      }
      // 包装基础设施错误
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }
}

// 表现层错误处理
export class UserController {
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(req.params.id);
      res.json(user);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return res.status(404).json({ error: error.message, code: error.code });
      }
      next(error); // 传递给全局错误处理器
    }
  }
}

// 全局错误处理中间件
export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Unhandled error:', error);
  
  if (error instanceof DomainError) {
    return res.status(400).json({ error: error.message, code: error.code });
  }
  
  res.status(500).json({ error: 'Internal server error' });
}
```

#### 架构模式选择

**请求-响应模式** (适用于 Web API)
```typescript
// 同步处理
app.post('/users', async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
});
```

**事件驱动模式** (适用于异步处理)
```typescript
// 事件发布
class UserService {
  async createUser(userData: CreateUserRequest): Promise<User> {
    const user = await this.userRepository.create(userData);
    
    // 发布事件，不等待处理结果
    this.eventBus.publish('user.created', { userId: user.id, email: user.email });
    
    return user;
  }
}

// 事件监听
class EmailService {
  @EventHandler('user.created')
  async handleUserCreated(event: UserCreatedEvent) {
    await this.sendWelcomeEmail(event.email);
  }
}
```

**中间件模式** (适用于请求处理管道)
```typescript
const app = express();

// 认证中间件
app.use(authMiddleware);

// 日志中间件
app.use(loggingMiddleware);

// 限流中间件
app.use(rateLimitMiddleware);

// 业务路由
app.use('/api', apiRoutes);

// 错误处理中间件
app.use(errorHandler);
```

#### 架构决策矩阵

| 场景 | 推荐模式 | 理由 |
|------|----------|------|
| Web API | 分层架构 + 依赖注入 | 清晰的职责分离，易于测试 |
| 实时应用 | 事件驱动 + 发布订阅 | 高并发，松耦合 |
| 数据处理 | 管道模式 | 流式处理，易于扩展 |
| 微服务 | 六边形架构 | 端口适配器，技术无关 |

#### 架构评审检查清单

**设计阶段**:
- [ ] 是否遵循单一职责原则？
- [ ] 依赖关系是否清晰？
- [ ] 是否便于单元测试？
- [ ] 错误处理策略是否明确？

**实现阶段**:
- [ ] 接口定义是否稳定？
- [ ] 配置是否外部化？
- [ ] 日志记录是否充分？
- [ ] 性能瓶颈是否识别？

**部署阶段**:
- [ ] 环境配置是否隔离？
- [ ] 监控指标是否完整？
- [ ] 回滚策略是否可行？
- [ ] 文档是否更新？

### Code Quality

- **Every commit must**:
  - Compile successfully
  - Pass all existing tests
  - Include tests for new functionality
  - Follow project formatting/linting

- **Before committing**:
  - Run formatters/linters
  - Self-review changes
  - Ensure commit message explains "why"

### Error Handling

- Fail fast with descriptive messages
- Include context for debugging
- Handle errors at appropriate level
- Never silently swallow exceptions
- 从第一性原则出发，思考错误处理的最佳实践

## Decision Framework

When multiple valid approaches exist, choose based on:

1. **Testability** - Can I easily test this?
2. **Readability** - Will someone understand this in 6 months?
3. **Consistency** - Does this match project patterns?
4. **Simplicity** - Is this the simplest solution that works?
5. **Reversibility** - How hard to change later?

## Project Integration

### Learning the Codebase

- Find 3 similar features/components
- Identify common patterns and conventions
- Use same libraries/utilities when possible
- Follow existing test patterns

### Tooling

- Use project's existing build system
- Use project's test framework
- Use project's formatter/linter settings
- Don't introduce new tools without strong justification

## Quality Gates

### Definition of Done

- [ ] Tests written and passing
- [ ] Code follows project conventions
- [ ] No linter/formatter warnings
- [ ] Commit messages are clear
- [ ] Implementation matches plan
- [ ] No TODOs without issue numbers

### Test Guidelines

- Test behavior, not implementation
- One assertion per test when possible
- Clear test names describing scenario
- Use existing test utilities/helpers
- Tests should be deterministic

## Important Reminders

**NEVER**:

- Use `--no-verify` to bypass commit hooks
- Disable tests instead of fixing them
- Commit code that doesn't compile
- Make assumptions - verify with existing code

**ALWAYS**:

- **行动优先于确认 (Act-Then-Confirm)**: 必须先实际执行操作（例如写入文件、运行命令），并在确认成功后，才能在对话中表明操作已完成。
- Commit working code incrementally
- Update plan documentation as you go
- Learn from existing implementations
- Stop after 3 failed attempts and reassess
- think in English, write in Chinese
