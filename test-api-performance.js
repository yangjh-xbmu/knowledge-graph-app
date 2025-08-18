import fetch from 'node-fetch';

// 测试API性能
async function testApiPerformance() {
  console.log('=== API性能测试开始 ===');
  
  const testUrl = 'http://localhost:3000/api/test-direct-api';
  const testData = {
    prompt: '你好，请简单介绍一下自己。'
  };
  
  console.log('测试URL:', testUrl);
  console.log('测试数据:', JSON.stringify(testData, null, 2));
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('\n=== 测试结果 ===');
    console.log('响应状态:', response.status, response.statusText);
    console.log('响应时间:', responseTime, 'ms');
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ API调用成功!');
      console.log('配置:', result.data?.metadata?.config);
      console.log('实际API响应时间:', result.data?.metadata?.responseTime, 'ms');
      console.log('AI响应:', result.data?.response?.substring(0, 100) + '...');
      
      // 性能评估
      if (responseTime < 5000) {
        console.log('🚀 性能优秀: 响应时间 < 5秒');
      } else if (responseTime < 15000) {
        console.log('⚡ 性能良好: 响应时间 < 15秒');
      } else {
        console.log('🐌 性能需要改进: 响应时间 > 15秒');
      }
    } else {
      const errorResult = await response.json();
      console.log('❌ API调用失败:', errorResult.message);
      console.log('错误详情:', errorResult.error);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
  
  console.log('\n=== API性能测试结束 ===');
}

// 运行测试
testApiPerformance().catch(console.error);