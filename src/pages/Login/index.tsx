import { useCallback } from "react";
import { AccessService } from "@/services/accessService";
import { useToastStore } from "@/store/useToastStore";
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const {addToast} = useToastStore()

  const loginWithGoogleOAuth = useCallback(() => {
    AccessService.getGoogleOAuthLoginUrl()
    .then(url => {
      window.open(url, 'blank')
    })
    .catch(err => {
      console.error(err)
      addToast('API error', 'error')
    })
  }, [])

  return (
    <div>
      <div className="flex flex-1 overflow-y-auto p-6 space-y-4 justify-center items-center">
        <Button
          variant={"outline"}
          className="cursor-pointer"
          onClick={() => loginWithGoogleOAuth()}
        >
          <FcGoogle />
          Login with Google
        </Button>
      </div>
    </div>
  );
}