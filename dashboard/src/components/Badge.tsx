import { LoanApplication } from '../../../server/src/types';

interface BadgeProps {
    type: LoanApplication['status'] | 'PENDING';
}

export const Badge: React.FC<BadgeProps> = ({ type }) => {
    const styles: Record<string, string> = {
        APPROVED: "bg-green-100 text-green-800 border-green-200",
        REJECTED: "bg-red-100 text-red-800 border-red-200",
        INFO_REQUESTED: "bg-yellow-100 text-yellow-800 border-yellow-200",
        PENDING: "bg-orange-100 text-orange-800 border-orange-200",
        SUBMITTED: "bg-blue-100 text-blue-800 border-blue-200",
        SYNCED: "bg-blue-100 text-blue-800 border-blue-200",
        RESUBMITTED: "bg-purple-100 text-purple-800 border-purple-200",
        DRAFT: "bg-gray-100 text-gray-800 border-gray-200"
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[type] || styles.PENDING}`}>
            {type.replace('_', ' ')}
        </span>
    );
};
