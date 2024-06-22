import { LuAlertCircle, LuTicket } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
type RegistrationSectionProps = {
  state: "closed" | "waitlist" | "open";
};
export default function RegistrationSection({
  state,
}: RegistrationSectionProps) {
  if (state === "closed") {
    return (
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center gap-2">
          <LuAlertCircle className="size-5" />
          <h2 className="font-semibold">Registration Closed</h2>
        </div>
        <div className="mt-2">
          <p className="text-muted-foreground text-sm">
            This event is not currently accepting new registrations. Please
            contact the host if needed.
          </p>
        </div>
      </div>
    );
  } else if (state === "waitlist") {
    return (
      <Card className="mx-auto w-full">
        <CardHeader className="p-4 pb-3">
          <CardTitle>Event Full</CardTitle>
          <CardDescription>
            We are at capacity, please join the waitlist
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="">
            <p className="text-foreground text-sm">
              Please click on the button below to join the waitlist. You will be
              notified if additional spots become available.
            </p>
          </div>
          <div className="mt-4 text-center text-sm">
            <Button className="w-full font-semibold">Join Waitlist</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="mx-auto w-full">
      <CardHeader className="p-4 pb-3">
        <CardTitle>Register now</CardTitle>
        <CardDescription>Join us and register today!</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="">
          <p className="text-foreground text-sm">
            Please click on the button below to register for our upcoming event.
          </p>
        </div>
        <div className="mt-4 text-center text-sm">
          <Button className="w-full font-semibold">Register</Button>
        </div>
      </CardContent>
    </Card>
  );
}
