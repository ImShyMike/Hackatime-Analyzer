declare global {
	interface UserStats {
		username?: string;
		user_id?: string;
		total_seconds?: number;
		human_readable_total?: string;
		daily_average?: number;
		human_readable_daily_average?: string;
	}

	interface Span {
		start_time: Date;
		end_time: Date;
		duration: number;
	}

	interface Day {
		date: Date;
		sessions: Span[];
	}

	interface Hour {
		hour: Date;
		sessions: Span[];
	}
}

export {};
