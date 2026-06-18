"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Car,
  CheckCircle2,
  Clock,
  ExternalLink,
  XCircle,
} from "lucide-react";

import { getReviews } from "@/modules/review/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ReviewsPage() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: getReviews,
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Review History
        </h1>
        <p className="text-muted-foreground">
          View all AI code reviews
        </p>
      </div>

      {reviews?.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No reviews yet. Connect a repository and open a PR to get
                reviews.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {reviews?.map((review: any) => (
            <Card
              key={review.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-lg">
                        {review.prTitle || `PR #${review.prNumber}`}
                      </CardTitle>

                      {review.status === "COMPLETED" && (
                        <Badge
                          variant="default"
                          className="gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
                        </Badge>
                      )}

                      {review.status === "FAILED" && (
                        <Badge
                          variant="destructive"
                          className="gap-1"
                        >
                          <XCircle className="h-3 w-3" />
                          Failed
                        </Badge>
                      )}

                      {review.status === "PENDING" && (
                        <Badge
                          variant="secondary"
                          className="gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </div>

                    <CardDescription className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      {review.repository?.name || "Repository"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>PR #{review.prNumber}</span>

                  <span>
                    {formatDistanceToNow(
                      new Date(review.createdAt),
                      { addSuffix: true }
                    )}
                  </span>
                </div>

                {review.review && (
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <p className="line-clamp-4 whitespace-pre-wrap text-sm">
                      {review.review}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {review.prUrl && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <a
                        href={review.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View PR
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}