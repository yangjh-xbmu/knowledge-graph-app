// LangChain API 测试脚本
// 用于测试 LangChain 方式调用大模型的功能

// 使用 Node.js 内置的 fetch API (Node.js 18+)

async function testLangChainAPI() {
  console.log('=== LangChain API 测试开始 ===');
  
  const testCases = [
    {
      name: '基础测试',
      topic: 'JavaScript基础',
      description: '测试默认主题的 LangChain 调用'
    },
    {
      name: '中文测试',
      topic: '人工智能的发展历程',
      description: '测试中文主题的 LangChain 调用'
    },
    {
      name: '技术测试',
      topic: 'React Hooks 的使用方法',
      description: '测试技术相关主题的 LangChain 调用'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.name} ---`);
    console.log(`主题: ${testCase.topic}`);
    console.log(`描述: ${testCase.description}`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:3000/api/test-langchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: testCase.topic }),
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`响应状态: ${response.status} ${response.statusText}`);
      console.log(`响应时间: ${duration}ms`);
      
      if (!response.ok) {
        console.error(`❌ HTTP 错误: ${response.status}`);
        const errorText = await response.text();
        console.error('错误详情:', errorText);
        continue;
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ LangChain 调用成功!');
        console.log(`结果长度: ${data.result?.length || 0} 字符`);
        console.log(`模型: ${data.metadata?.modelName || 'unknown'}`);
        console.log(`执行时间: ${data.metadata?.duration || duration}ms`);
        
        // 显示部分结果内容
        if (data.result) {
          const preview = data.result.length > 200 
            ? data.result.substring(0, 200) + '...'
            : data.result;
          console.log('AI 响应预览:');
          console.log(preview);
        }
      } else {
        console.log('❌ LangChain 调用失败');
        console.log('错误信息:', data.error);
        console.log('错误详情:', data.details);
        console.log('错误类型:', data.errorType);
      }
      
    } catch (error) {
      console.error('❌ 请求失败:', error.message);
      if (error.code) {
        console.error('错误代码:', error.code);
      }
    }
    
    // 在测试之间稍作停顿
    if (testCase !== testCases[testCases.length - 1]) {
      console.log('等待 2 秒后进行下一个测试...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n=== LangChain API 测试完成 ===');
}

// 性能分析函数
async function analyzeLangChainPerformance() {
  console.log('\n=== LangChain 性能分析 ===');
  
  const iterations = 3;
  const topic = 'TypeScript 基础概念';
  const times = [];
  
  for (let i = 1; i <= iterations; i++) {
    console.log(`\n第 ${i} 次性能测试...`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:3000/api/test-langchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      times.push(duration);
      
      console.log(`响应时间: ${duration}ms`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ 调用成功');
        } else {
          console.log('❌ 调用失败:', data.error);
        }
      } else {
        console.log('❌ HTTP 错误:', response.status);
      }
      
    } catch (error) {
      console.error('❌ 请求异常:', error.message);
    }
    
    // 测试间隔
    if (i < iterations) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // 计算性能统计
  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log('\n--- 性能统计 ---');
    console.log(`平均响应时间: ${avgTime.toFixed(2)}ms`);
    console.log(`最快响应时间: ${minTime}ms`);
    console.log(`最慢响应时间: ${maxTime}ms`);
    console.log(`响应时间范围: ${maxTime - minTime}ms`);
  }
  
  console.log('=== 性能分析完成 ===');
}

// 主函数
async function main() {
  try {
    // 基础功能测试
    await testLangChainAPI();
    
    // 性能分析
    await analyzeLangChainPerformance();
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
main();