import type { FC } from "react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

const Pagination: FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
	if (totalPages <= 1) return null;

	const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

	return (
		<div className="flex items-center justify-center gap-1 pt-4">
			<button
				type="button"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-[#F0EBE1]/70 transition hover:bg-white/10 hover:text-[#F0EBE1] disabled:cursor-not-allowed disabled:opacity-40"
			>
				‹ Prev
			</button>

			{pages.map((page) => (
				<button
					key={page}
					type="button"
					onClick={() => onPageChange(page)}
					className={`min-w-[2.25rem] rounded-lg px-3 py-2 text-sm font-bold transition ${
						page === currentPage
							? "bg-[#7DC542] text-[#0B1A08] shadow-[0_4px_12px_rgba(125,197,66,0.25)]"
							: "border border-white/10 bg-white/5 text-[#F0EBE1]/60 hover:bg-white/10 hover:text-[#F0EBE1]"
					}`}
				>
					{page}
				</button>
			))}

			<button
				type="button"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-[#F0EBE1]/70 transition hover:bg-white/10 hover:text-[#F0EBE1] disabled:cursor-not-allowed disabled:opacity-40"
			>
				Next ›
			</button>
		</div>
	);
};

export default Pagination;
