import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

interface SectionHeaderProps {
  title: string
  subtitle: string
  link?: string
}

function SectionHeader({
  title,
  subtitle,
  link,
}: SectionHeaderProps) {
  return (
    <div className="mb-7 flex items-end justify-between">
      <div>
        <h2 className="text-[30px] font-extrabold tracking-[-0.8px] text-[#0f172b]">
          {title}
        </h2>

        <p className="mt-1 text-[16px] text-[#5f7694]">
          {subtitle}
        </p>
      </div>

      {link && (
        <Link
          to={link}
          className="hidden items-center gap-1 text-[14px] font-medium text-[#008bd0] sm:flex"
        >
          View All
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}

export default SectionHeader