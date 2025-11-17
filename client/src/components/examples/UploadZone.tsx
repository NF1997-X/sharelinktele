import UploadZone from '../UploadZone'

export default function UploadZoneExample() {
  return (
    <UploadZone 
      onFilesSelected={(files) => console.log('Selected files:', files)}
    />
  )
}
