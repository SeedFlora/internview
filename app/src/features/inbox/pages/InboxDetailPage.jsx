import { useContext } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { UserContext } from "@/context/userContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InboxDetailSkeleton } from "@/features/inbox/components/InboxDetailSkeleton";
import { InboxDetailView } from "@/features/inbox/components/InboxDetailView";
import { useInboxDetail } from "@/features/inbox/hooks/useInboxDetail";

export function InboxDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const navigate = useNavigate();
  const { user, loading: userLoading } = useContext(UserContext);

  const {
    requestData,
    reviewInformation,
    loading,
    auditLoading,
    timeline,
  } = useInboxDetail({ id, type, user, userLoading, navigate });

  if (userLoading || loading) {
    return <InboxDetailSkeleton />;
  }

  if (!requestData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Inbox item not found</p>
            <Button onClick={() => navigate("/")} variant="outline" className="mt-4">
              Go back home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <InboxDetailView
      requestId={id}
      requestData={requestData}
      reviewInformation={reviewInformation}
      currentUserRole={user?.role}
      timeline={timeline}
      auditLoading={auditLoading}
    />
  );
}
