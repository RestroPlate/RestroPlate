interface StatusNoticeProps {
	type: "success" | "error";
	message: string;
	onClose?: () => void;
}

const NOTICE_STYLES: Record<StatusNoticeProps["type"], { container: string; button: string }> = {
	success: {
		container: "border-emerald-400/35 bg-emerald-500/10 text-emerald-100",
		button: "text-emerald-200 hover:text-emerald-50",
	},
	error: {
		container: "border-rose-400/35 bg-rose-500/10 text-rose-100",
		button: "text-rose-200 hover:text-rose-50",
	},
};

export default function StatusNotice({ type, message, onClose }: StatusNoticeProps) {
	const styles = NOTICE_STYLES[type];

	return (
		<div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${styles.container}`} role="alert">
			<div className="flex items-start justify-between gap-3">
				<p>{message}</p>
				{onClose ? (
					<button
						type="button"
						className={`shrink-0 text-xs font-bold tracking-wide transition-colors ${styles.button}`}
						onClick={onClose}
					>
						CLOSE
					</button>
				) : null}
			</div>
		</div>
	);
}
