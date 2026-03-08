import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-gray-500">ページが見つかりませんでした</p>
      <Link
        href="/"
        className="mt-6 text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600"
      >
        トップへ戻る
      </Link>
    </div>
  );
}
