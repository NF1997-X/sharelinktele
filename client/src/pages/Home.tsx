export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">MediaShare Bridge</h1>
      <p className="text-lg mb-4">Upload and share your files via Telegram</p>
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-2xl">Quick Upload</h2>
          <p>Drag and drop your files here</p>
        </div>
        <div className="p-4 border rounded">
          <h2 className="text-2xl">View Library</h2>
          <p>See all your uploaded files</p>
        </div>
      </div>
    </div>
  );
}
