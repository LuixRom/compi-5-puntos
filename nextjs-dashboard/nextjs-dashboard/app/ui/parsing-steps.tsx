"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Badge } from "@/app/ui/badge";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";

interface ParsingStepsProps {
  result: {
    success: boolean;
    steps: Array<{ step: number; stack: number[]; symbols: string[]; input: string[]; action: string }>;
    error?: string;
    message?: string;
  };
}

export function ParsingSteps({ result }: ParsingStepsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {result.success ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
          Pasos de Análisis
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant={result.success ? "default" : "destructive"}>{result.success ? "Aceptada" : "Rechazada"}</Badge>
          <Badge variant="outline">{result.steps.length} pasos</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {result.error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-destructive text-sm">{result.error}</p>
          </div>
        )}
        {result.message && result.success && (
          <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200">
            <p className="text-green-700 text-sm">{result.message}</p>
          </div>
        )}

        <div className="space-y-3">
          {result.steps.map((s, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <Badge variant="outline" className="min-w-[60px] justify-center">{s.step}</Badge>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Pila Estados</div>
                  <code className="text-sm font-mono bg-background px-2 py-1 rounded">[{s.stack.join(", ")}]</code>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Pila Símbolos</div>
                  <code className="text-sm font-mono bg-background px-2 py-1 rounded">[{s.symbols.join(", ")}]</code>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Entrada</div>
                  <code className="text-sm font-mono bg-background px-2 py-1 rounded">{s.input.join(" ")}</code>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Acción</div>
                  <Badge variant="secondary" className="font-mono text-xs">{s.action}</Badge>
                </div>
              </div>
              {i < result.steps.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
