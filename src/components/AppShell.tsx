
export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <div className="border-b p-4">HR Administration System</div>
            <div className="flex">
                <div className="w-56 border-r p-4">Menu</div>
                <div className="flex-1 p-6">{children}</div>
            </div>
        </div>
    );
}