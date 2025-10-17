"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Badge } from "@/app/ui/badge";

export function ParsingTable({ parserData }: { parserData: any }) {
  const td = parserData?.table_data;

  if (!td || !td.terminals || !td.non_terminals || !td.states || !td.productions) {
    return (
      <Card>
        <CardHeader><CardTitle>Tabla de Análisis LR(1)</CardTitle></CardHeader>
        <CardContent className="text-muted-foreground py-8 text-center">
          No hay datos de tabla disponibles. Construye el parser o revisa errores.
        </CardContent>
      </Card>
    );
  }

  const { terminals, non_terminals, states, productions } = td;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabla de Análisis LR(1)</CardTitle>
        <div className="flex gap-2">
          <Badge variant="outline">{states.length} estados</Badge>
          <Badge variant="outline">{terminals.length} terminales</Badge>
          <Badge variant="outline">{non_terminals.length} no terminales</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Producciones:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {productions.map((p: string, i: number) => (
              <div key={i} className="font-mono bg-muted/50 px-2 py-1 rounded">
                {i}: {p}
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left font-medium bg-muted">Estado</th>
                {terminals.map((t: string) => (
                  <th key={t} className="p-2 text-center font-medium bg-muted min-w-[80px]">{t}</th>
                ))}
                {non_terminals.map((nt: string) => (
                  <th key={nt} className="p-2 text-center font-medium bg-accent min-w-[80px]">{nt}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {states.map((s: any) => (
                <tr key={s.state} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-mono font-medium">
                    <div className="flex flex-col">
                      <span>{s.state}</span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {s.items?.map((it: string, idx: number) => (
                          <div key={idx} className="font-mono">{it}</div>
                        ))}
                      </div>
                    </div>
                  </td>
                  {terminals.map((t: string) => (
                    <td key={t} className="p-2 text-center">{s[t] && <ActionCell action={s[t]} />}</td>
                  ))}
                  {non_terminals.map((nt: string) => (
                    <td key={nt} className="p-2 text-center">
                      {s[nt] && <span className="font-mono text-sm">{s[nt]}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionCell({ action }: { action: string }) {
  const type =
    action?.startsWith?.("d") ? "shift" :
    action?.startsWith?.("r") ? "reduce":
    action === "acc" ? "accept" : "goto";

  const variants = { shift: "default", reduce: "secondary", accept: "outline", goto: "outline" } as const;
  return <Badge variant={variants[type]} className="font-mono text-xs">{action}</Badge>;
}
