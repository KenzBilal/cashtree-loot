import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div style={{
      display: 'flex', 
      height: '100%', 
      width: '100%', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '200px' // Ensures it doesn't collapse
    }}>
      <Loader2 className="animate-spin" size={32} color="#00ff88" />
    </div>
  );
}