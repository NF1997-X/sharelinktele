import MediaCard from '../MediaCard'

export default function MediaCardExample() {
  return (
    <div className="max-w-sm">
      <MediaCard
        id="1"
        fileName="vacation-photo.jpg"
        fileSize="2.4 MB"
        fileType="image"
        uploadDate="2 hours ago"
        shareLink="https://t.me/share/abc123xyz"
        onDelete={(id) => console.log('Delete:', id)}
      />
    </div>
  )
}
