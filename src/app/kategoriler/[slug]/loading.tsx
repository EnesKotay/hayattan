export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-gray-300 border-t-gray-600" role="status">
                    <span className="sr-only">Yükleniyor...</span>
                </div>
                <p className="mt-4 text-gray-600">Kategori yükleniyor...</p>
            </div>
        </div>
    );
}
