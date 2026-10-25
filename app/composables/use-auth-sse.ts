export default function () {
  return useEventSource('http://localhost:3000/sse')
}
