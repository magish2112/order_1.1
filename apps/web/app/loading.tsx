export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Загрузка...</p>
      </div>
    </div>
  )
}

