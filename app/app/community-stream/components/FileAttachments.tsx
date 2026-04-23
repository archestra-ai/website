import { FileText, Image as ImageIcon } from 'lucide-react';

interface FileInfo {
  name: string;
  mimetype: string;
  url: string;
}

interface FileAttachmentsProps {
  files: FileInfo[] | null;
}

export default function FileAttachments({ files }: FileAttachmentsProps) {
  if (!files || files.length === 0) return null;

  const images = files.filter((f) => f.mimetype.startsWith('image/'));
  const others = files.filter((f) => !f.mimetype.startsWith('image/'));

  return (
    <div className="flex flex-col gap-2 mt-2">
      {images.length > 0 && (
        <a
          href="/join-slack"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-3 w-[300px] h-[300px] rounded-xl border-2 border-dashed border-gray-300 bg-[#F8F8FA] hover:bg-[#EDEDF2] hover:border-gray-400 transition-colors"
        >
          <ImageIcon className="w-10 h-10 text-[#9B9BA3]" />
          <span className="text-[14px] font-medium text-[#616061]">Join Slack to see the image</span>
        </a>
      )}
      {others.map((file, i) => (
        <a
          key={i}
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 w-fit px-3 py-2 rounded-lg border border-gray-200 bg-[#F8F8F8] hover:bg-[#EDEDEF] transition-colors text-[13px] text-[#1D1C1D]"
        >
          <FileText className="w-4 h-4 text-[#616061] flex-shrink-0" />
          <span className="truncate max-w-[200px]">{file.name}</span>
        </a>
      ))}
    </div>
  );
}
