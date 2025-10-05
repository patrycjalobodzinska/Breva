import PanelLayout from "@/components/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PanelPage() {
  return (
    <PanelLayout>
      <h1 className="text-4xl font-bold text-text-primary mb-8">
        Witaj w Panelu Użytkownika!
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-md p-6 bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-primary-dark">
              Przesyłanie plików
            </CardTitle>
          </CardHeader>
          <CardContent className="text-text-muted">
            Prześlij nowe zdjęcia, filmy lub pliki LiDAR do analizy.
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-md p-6 bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-primary-dark">
              Moje pomiary
            </CardTitle>
          </CardHeader>
          <CardContent className="text-text-muted">
            Przeglądaj historię swoich pomiarów i analiz.
          </CardContent>
        </Card>
      </div>
    </PanelLayout>
  );
}
