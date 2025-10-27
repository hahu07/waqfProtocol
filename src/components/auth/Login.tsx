import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { logger } from '@/lib/logger';

export const Login = () => {
  const { signIn, isLoading, isInitialized, error } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn();
    } catch (err) {
      logger.error('Login failed', err instanceof Error ? err : { error: err });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button 
        onClick={handleLogin} 
        disabled={!isInitialized || isLoading}
        loading={isLoading}
      >
        {!isInitialized 
          ? 'Initializing...' 
          : 'Continue with Internet Identity'
        }
      </Button>
      
      {!isInitialized && !error && (
        <p className="text-gray-500 text-sm">
          Please wait while we initialize the connection...
        </p>
      )}
      
      {error && (
        <p className="text-red-500 text-sm">
          {error.message}
        </p>
      )}
    </div>
  );
};
