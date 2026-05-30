import "server-only";

// 无 API key 时降级输出，前端体验保持流式
export function streamDemo(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for (const ch of text) {
        controller.enqueue(encoder.encode(ch));
        await new Promise((r) => setTimeout(r, 10));
      }
      controller.close();
    },
  });
}
