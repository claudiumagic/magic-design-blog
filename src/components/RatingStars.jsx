export default function RatingStars({
  value = 0,
  onRate,
  size = "text-xl",
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = value >= star;

        return (
          <button
            key={star}
            type="button"
            onClick={() => onRate?.(star)}
            className={`
              ${size}
              w-9 h-9 flex items-center justify-center
              transition-transform duration-200
              ${active ? "text-yellow-400" : "text-yellow-400/30"}
              hover:scale-125 cursor-pointer
              bg-transparent border-0
            `}
            aria-label={`Rate ${star} stars`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
