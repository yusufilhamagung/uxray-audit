export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="section-container flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-orange-600"></div>
            <span className="font-bold text-slate-900">UXAudit AI</span>
         </div>
         
         <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-orange-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-orange-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-orange-600 transition-colors">Contact</a>
         </div>
         
         <div className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} UXAudit AI. All rights reserved.
         </div>
      </div>
    </footer>
  );
}
