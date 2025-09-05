import { Typography } from "antd";

const { Link } = Typography;

export default function JobUrl({ title, upworkId }: { title: string; upworkId: string }) {
  return <Link href={`https://www.upwork.com/jobs/~02${upworkId}`}>{title}</Link>;
}
