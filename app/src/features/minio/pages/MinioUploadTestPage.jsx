import { useFileUpload } from "@/hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function MinioUploadTestPage() {
  const {
    fileName,
    setFileName,
    requestingUrl,
    uploading,
    compressing,
    result,
    handleFileChange,
    handleUpload,
  } = useFileUpload();

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-start justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Upload File ke MinIO</CardTitle>
          <CardDescription>
            Pilih file dan upload ke MinIO menggunakan presigned URL.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pilih File</label>
            <Input type="file" onChange={handleFileChange} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nama File (opsional)</label>
            <Input
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              placeholder="Masukkan nama file"
            />
          </div>

          <Button onClick={handleUpload} disabled={uploading || requestingUrl || compressing} className="w-full">
            {compressing ? "Mengompresi..." : requestingUrl ? "Meminta URL..." : uploading ? "Mengupload..." : "Upload File"}
          </Button>

          {result && (
            <div className="rounded-md border p-3 bg-muted/20">
              <p className="text-sm font-medium mb-2">Hasil</p>
              <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}