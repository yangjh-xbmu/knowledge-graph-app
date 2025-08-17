import { KnowledgeGraph } from '@/types/knowledge';

export const knowledgeGraph: KnowledgeGraph = {
  nodes: [
    {
      id: 'why-typescript',
      title: '为什么是 TypeScript？',
      description: '了解TypeScript的核心价值和优势',
      category: 'basic',
      level: 1,
      prerequisites: [],
      content: `# 为什么是 TypeScript？

## 核心优势

### 类型安全 (Type Safety)
在编译阶段发现错误，而不是在运行时。这意味着：
- 减少运行时错误
- 提高代码质量
- 更早发现潜在问题

### 更好的工具支持 (Better Tooling)
- 无与伦比的代码自动补全
- 智能重构功能
- 精确的代码导航
- IDE集成度更高

### 代码可读性与可维护性 (Readability & Maintainability)
- 类型本身就是一种文档
- 代码意图更加明确
- 团队协作更加高效`,
      examples: [
        '// JavaScript - 运行时才发现错误\nfunction greet(name) {\n  return "Hello " + name.toUppercase(); // 拼写错误\n}',
        '// TypeScript - 编译时发现错误\nfunction greet(name: string): string {\n  return "Hello " + name.toUpperCase(); // IDE会提示正确方法\n}'
      ],
      position: { x: 250, y: 50 }
    },
    {
      id: 'basic-types',
      title: '基础类型',
      description: 'TypeScript的基本数据类型',
      category: 'basic',
      level: 2,
      prerequisites: ['why-typescript'],
      content: `# 基础类型 (Basic Types)

## JS 已有类型
- \`string\`: 字符串类型
- \`number\`: 数字类型
- \`boolean\`: 布尔类型
- \`null\` 和 \`undefined\`: 空值类型
- \`symbol\`: 符号类型
- \`bigint\`: 大整数类型

## TS 新增类型

### \`any\` 类型
放弃类型检查，回到 JavaScript。**慎用！**

### \`unknown\` 类型
\`any\` 的安全版本，使用前必须进行类型检查或断言。

### \`void\` 类型
通常用于表示函数没有返回值。

### \`never\` 类型
表示永远不会返回值的函数类型（如抛出异常或无限循环）。

### 数组类型
- \`string[]\` 或 \`Array<string>\` 两种写法

### 元组 (Tuple)
\`[string, number]\`，一个已知长度和类型的数组。`,
      examples: [
        'let name: string = "Alice";\nlet age: number = 30;\nlet isActive: boolean = true;',
        'let data: unknown = getData();\nif (typeof data === "string") {\n  console.log(data.toUpperCase());\n}',
        'let coordinates: [number, number] = [10, 20];'
      ],
      position: { x: 250, y: 200 }
    },
    {
      id: 'type-declaration',
      title: '类型声明与推断',
      description: '如何声明类型和利用类型推断',
      category: 'basic',
      level: 2,
      prerequisites: ['basic-types'],
      content: `# 类型声明与推断

## 显式声明
明确指定变量的类型：
\`\`\`typescript
let name: string = 'Alice';
let age: number = 30;
\`\`\`

## 类型推断
TypeScript 会自动推断变量的类型：
\`\`\`typescript
let age = 30; // TS 会自动推断 age 为 number 类型
\`\`\`

## 最佳实践
- 在变量初始化时，优先使用类型推断
- 在函数参数、返回值和复杂的对象结构上，使用显式声明
- 保持代码简洁的同时确保类型安全`,
      examples: [
        '// 显式声明\nlet userName: string = "John";\nlet userAge: number = 25;',
        '// 类型推断\nlet userName = "John"; // string\nlet userAge = 25; // number\nlet isLoggedIn = true; // boolean'
      ],
      position: { x: 500, y: 200 }
    },
    {
      id: 'functions',
      title: '函数',
      description: 'TypeScript中的函数类型定义',
      category: 'basic',
      level: 3,
      prerequisites: ['type-declaration'],
      content: `# 函数 (Functions)

## 参数类型
为函数参数指定类型：
\`\`\`typescript
function greet(name: string) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## 返回值类型
指定函数的返回值类型：
\`\`\`typescript
function getAge(): number {
  return 30;
}
\`\`\`

## 可选参数与默认参数
\`\`\`typescript
// 可选参数
function buildName(firstName: string, lastName?: string) {
  return lastName ? \`\${firstName} \${lastName}\` : firstName;
}

// 默认参数
function buildName(firstName: string, lastName = 'Smith') {
  return \`\${firstName} \${lastName}\`;
}
\`\`\`

## 函数重载 (Overload)
为同一个函数提供多个函数类型定义。`,
      examples: [
        'function add(a: number, b: number): number {\n  return a + b;\n}',
        'function greet(name: string, age?: number): string {\n  return age ? \`Hello \${name}, you are \${age}\` : \`Hello \${name}\`;\n}'
      ],
      position: { x: 750, y: 200 }
    },
    {
      id: 'interfaces',
      title: '接口与类型别名',
      description: '定义对象类型的两种方式',
      category: 'basic',
      level: 3,
      prerequisites: ['functions'],
      content: `# 接口 (Interfaces) 与 类型别名 (Type Aliases)

## 接口 \`interface\`
定义对象的"形状"（shape）：
\`\`\`typescript
interface User {
  id: number;
  name: string;
  isActive: boolean;
  // 可选属性
  email?: string;
  // 只读属性
  readonly registrationDate: Date;
}
\`\`\`

## 类型别名 \`type\`
为任何类型创建一个新名字：
\`\`\`typescript
type Point = {
  x: number;
  y: number;
};
\`\`\`

## \`interface\` vs \`type\`

### 共同点
都能描述对象或函数的形状。

### 不同点
- \`interface\` 可以被 \`extends\` 和 \`implements\`，支持声明合并
- \`type\` 更灵活，可以用于联合类型、元组等任何类型

### 团队约定
优先使用 \`interface\` 定义对象，用 \`type\` 定义联合类型、交叉类型等。`,
      examples: [
        'interface User {\n  id: number;\n  name: string;\n  email?: string;\n}',
        'type Status = "pending" | "approved" | "rejected";\ntype UserWithStatus = User & { status: Status; };'
      ],
      position: { x: 250, y: 350 }
    },
    {
      id: 'union-intersection',
      title: '联合类型与交叉类型',
      description: '组合类型的强大功能',
      category: 'advanced',
      level: 4,
      prerequisites: ['interfaces'],
      content: `# 联合类型与交叉类型

## 联合类型 \`|\`
表示一个值可以是几种类型之一：
\`\`\`typescript
let id: string | number;
id = 101;
id = 'abc';
\`\`\`

## 交叉类型 \`&\`
将多个类型合并为一个：
\`\`\`typescript
interface Colorful { color: string; }
interface Circle { radius: number; }
type ColorfulCircle = Colorful & Circle; // 拥有 color 和 radius 属性
\`\`\`

## 类型守卫 (Type Guards)
在联合类型中，通过 \`typeof\`, \`instanceof\`, \`in\` 等方式收窄类型范围：
\`\`\`typescript
function processId(id: string | number) {
  if (typeof id === 'string') {
    // 这里 id 被收窄为 string 类型
    return id.toUpperCase();
  } else {
    // 这里 id 被收窄为 number 类型
    return id.toFixed(2);
  }
}
\`\`\``,
      examples: [
        'type Status = "loading" | "success" | "error";\nlet currentStatus: Status = "loading";',
        'interface Name { name: string; }\ninterface Age { age: number; }\ntype Person = Name & Age;'
      ],
      position: { x: 500, y: 350 }
    },
    {
      id: 'generics',
      title: '泛型',
      description: 'TypeScript的核心特性之一',
      category: 'advanced',
      level: 5,
      prerequisites: ['union-intersection'],
      content: `# 泛型 (Generics)

## 核心思想
创建可重用的组件，使其能够处理多种数据类型而不是单一类型。就像给函数传递参数一样，泛型是给**类型**传递参数。

## 泛型函数
\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}
let output = identity<string>("myString");
\`\`\`

## 泛型接口
\`\`\`typescript
interface ApiResponse<T> {
  data: T;
  code: number;
  message: string;
}
\`\`\`

## 泛型约束
使用 \`extends\` 关键字限制泛型类型：
\`\`\`typescript
interface Lengthwise {
  length: number;
}
function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}
\`\`\``,
      examples: [
        'function createArray<T>(length: number, value: T): T[] {\n  return Array(length).fill(value);\n}',
        'interface Container<T> {\n  value: T;\n  getValue(): T;\n}'
      ],
      position: { x: 750, y: 350 }
    },
    {
      id: 'enums',
      title: '枚举',
      description: '定义命名常量集合',
      category: 'advanced',
      level: 4,
      prerequisites: ['union-intersection'],
      content: `# 枚举 (Enums)

用于定义一组命名的常量集合，可以是数字或字符串。

## 数字枚举
\`\`\`typescript
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right, // 3
}
\`\`\`

## 字符串枚举
\`\`\`typescript
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}
\`\`\`

## 使用场景
- 状态管理
- 配置选项
- 错误码定义
- API 响应类型`,
      examples: [
        'enum Color {\n  Red,\n  Green,\n  Blue\n}\nlet c: Color = Color.Green;',
        'enum HttpStatus {\n  OK = 200,\n  NotFound = 404,\n  InternalServerError = 500\n}'
      ],
      position: { x: 1000, y: 350 }
    },
    {
      id: 'classes',
      title: '类',
      description: 'TypeScript中的面向对象编程',
      category: 'advanced',
      level: 4,
      prerequisites: ['interfaces'],
      content: `# 类 (Classes)

## JS 基础上新增

### 访问修饰符
- \`public\` (默认): 公有属性，可以在任何地方访问
- \`private\`: 私有属性，只能在类内部访问
- \`protected\`: 受保护属性，只能在类及其子类中访问

### 只读属性
\`readonly\` 关键字定义只读属性。

### 抽象类 (Abstract Classes)
不能被实例化，只能被继承：
\`\`\`typescript
abstract class Animal {
  abstract makeSound(): void;
  move(): void {
    console.log('Moving...');
  }
}
\`\`\`

### 接口实现
\`\`\`typescript
class MyClass implements MyInterface {
  // 实现接口定义的所有属性和方法
}
\`\`\``,
      examples: [
        'class Person {\n  private name: string;\n  public age: number;\n  \n  constructor(name: string, age: number) {\n    this.name = name;\n    this.age = age;\n  }\n}',
        'interface Flyable {\n  fly(): void;\n}\n\nclass Bird implements Flyable {\n  fly() {\n    console.log("Flying...");\n  }\n}'
      ],
      position: { x: 250, y: 500 }
    },
    {
      id: 'utility-types',
      title: '工具类型',
      description: 'TypeScript内置的类型转换工具',
      category: 'practical',
      level: 6,
      prerequisites: ['generics'],
      content: `# 工具类型 (Utility Types)

TS 内置的一些常用类型转换工具，**必须掌握**！

## 常用工具类型

### \`Partial<T>\`
将 T 的所有属性变为可选：
\`\`\`typescript
interface User {
  name: string;
  age: number;
}
type PartialUser = Partial<User>; // { name?: string; age?: number; }
\`\`\`

### \`Readonly<T>\`
将 T 的所有属性变为只读。

### \`Pick<T, K>\`
从 T 中挑选出 K 属性。

### \`Omit<T, K>\`
从 T 中排除掉 K 属性。

### \`Record<K, T>\`
创建一个 key 为 K 类型，value 为 T 类型的对象。`,
      examples: [
        'type UserUpdate = Partial<User>;\ntype UserName = Pick<User, "name">;\ntype UserWithoutAge = Omit<User, "age">;',
        'type StringRecord = Record<string, number>;\n// 等同于 { [key: string]: number }'
      ],
      position: { x: 500, y: 500 }
    },
    {
      id: 'advanced-types',
      title: '高级类型操作',
      description: 'keyof, typeof, 映射类型等高级特性',
      category: 'practical',
      level: 7,
      prerequisites: ['utility-types'],
      content: `# 高级类型操作

## \`keyof\` 操作符
获取一个类型的所有公有属性名组成的联合类型：
\`\`\`typescript
interface Person {
  name: string;
  age: number;
}
type PersonKeys = keyof Person; // "name" | "age"
\`\`\`

## \`typeof\` 操作符
获取一个变量或属性的类型：
\`\`\`typescript
const person = { name: "Alice", age: 30 };
type PersonType = typeof person; // { name: string; age: number; }
\`\`\`

## 映射类型 (Mapped Types)
基于一个旧类型创建新类型，常与 \`keyof\` 结合使用：
\`\`\`typescript
type Optional<T> = {
  [P in keyof T]?: T[P];
};
\`\`\`

## 条件类型 (Conditional Types)
\`T extends U ? X : Y\`，类型中的三元运算符。`,
      examples: [
        'type Keys = keyof { name: string; age: number }; // "name" | "age"',
        'type NonNullable<T> = T extends null | undefined ? never : T;'
      ],
      position: { x: 750, y: 500 }
    },
    {
      id: 'modules',
      title: '模块与声明文件',
      description: 'TypeScript的模块系统和类型声明',
      category: 'practical',
      level: 5,
      prerequisites: ['classes'],
      content: `# 模块与声明文件

## 模块
TS 使用 ES6 模块系统 (\`import\`/\`export\`)：
\`\`\`typescript
// math.ts
export function add(a: number, b: number): number {
  return a + b;
}

// main.ts
import { add } from './math';
\`\`\`

## 声明文件 (\`.d.ts\`)
这是 TS 与 JS 生态系统协作的桥梁。

### 作用
- 为没有 TS 类型的第三方 JS 库提供类型信息
- 告诉 TS 编译器外部库的类型结构

### 使用
- 查找和安装社区维护的声明文件（如 \`@types/lodash\`）
- 为自己的 JS 库编写声明文件

### 全局声明
\`\`\`typescript
// global.d.ts
declare global {
  interface Window {
    myCustomProperty: string;
  }
}
\`\`\``,
      examples: [
        '// types.d.ts\ndeclare module "my-library" {\n  export function doSomething(): void;\n}',
        'npm install @types/lodash\n// 现在可以在 TS 中使用 lodash 并获得类型支持'
      ],
      position: { x: 1000, y: 500 }
    },
    {
      id: 'tsconfig',
      title: 'tsconfig.json配置',
      description: 'TypeScript项目的核心配置文件',
      category: 'practical',
      level: 6,
      prerequisites: ['modules'],
      content: `# 配置文件 \`tsconfig.json\`

这是 TS 项目的"大脑"，告诉编译器如何工作。

## 必知核心配置

### \`target\`
编译后输出的 JS 版本（如 \`ES5\`, \`ES2020\`）。

### \`module\`
编译后使用的模块系统（如 \`CommonJS\`, \`ESNext\`）。

### \`strict\`
**强烈建议开启**，它包含了一系列严格的类型检查规则：
- \`noImplicitAny\`: 禁止隐式 any 类型
- \`strictNullChecks\`: 严格的 null 检查
- \`strictFunctionTypes\`: 严格的函数类型检查

### \`outDir\`
编译后 JS 文件的输出目录。

### \`rootDir\`
TS 源文件的根目录。

### \`include\` / \`exclude\`
指定哪些文件需要被编译。`,
      examples: [
        '{\n  "compilerOptions": {\n    "target": "ES2020",\n    "module": "ESNext",\n    "strict": true,\n    "outDir": "./dist",\n    "rootDir": "./src"\n  },\n  "include": ["src/**/*"],\n  "exclude": ["node_modules"]\n}'
      ],
      position: { x: 750, y: 650 }
    }
  ],
  edges: [
    { id: 'e1', source: 'why-typescript', target: 'basic-types', type: 'prerequisite' },
    { id: 'e2', source: 'basic-types', target: 'type-declaration', type: 'prerequisite' },
    { id: 'e3', source: 'type-declaration', target: 'functions', type: 'prerequisite' },
    { id: 'e4', source: 'functions', target: 'interfaces', type: 'prerequisite' },
    { id: 'e5', source: 'interfaces', target: 'union-intersection', type: 'prerequisite' },
    { id: 'e6', source: 'union-intersection', target: 'generics', type: 'prerequisite' },
    { id: 'e7', source: 'union-intersection', target: 'enums', type: 'prerequisite' },
    { id: 'e8', source: 'interfaces', target: 'classes', type: 'prerequisite' },
    { id: 'e9', source: 'generics', target: 'utility-types', type: 'prerequisite' },
    { id: 'e10', source: 'utility-types', target: 'advanced-types', type: 'prerequisite' },
    { id: 'e11', source: 'classes', target: 'modules', type: 'prerequisite' },
    { id: 'e12', source: 'modules', target: 'tsconfig', type: 'prerequisite' },
    { id: 'e13', source: 'generics', target: 'advanced-types', type: 'related' },
    { id: 'e14', source: 'enums', target: 'utility-types', type: 'related' }
  ]
};