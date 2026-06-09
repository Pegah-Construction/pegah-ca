import Guard from "@/components/admin/Guard";
import NewsView from "@/components/admin/views/NewsView";

export default function AdminNews() {
  return (
    <Guard module="news" title="News & Blog" sub="Project case studies & articles">
      <NewsView />
    </Guard>
  );
}
