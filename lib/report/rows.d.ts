import { FullReport } from './generateReport';
interface Row {
    category: string;
    check: string;
    status: 'CLEAR' | 'FLAGGED';
    detail: string;
}
export declare function allRows(report: FullReport): Row[];
export type { Row };
