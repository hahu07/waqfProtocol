import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";

export const Login = () => {
  const { signIn, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button 
        onClick={handleLogin} 
        loading={isLoading}
      >
        Continue with Internet Identity
      </Button>
      
      {error && (
        <p className="text-red-500 text-sm">
          {error.message}
        </p>
      )}
    </div>
  );
};