// components/parser-interface.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/ui/card";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Badge } from "@/app/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/ui/tabs";

import { GrammarInput } from "./grammar-input";
import { ParsingTable } from "./parsing-table";
import { ParsingSteps } from "./parsing-steps";
import { ParseTree } from "./parse-tree";
import { AutomatonVisualizer } from "./automaton-visualizer";

import { Play, FileText, Table, TreePine, Settings, GitBranch, Workflow } from "lucide-react";

export function ParserInterface() {
  const [grammar, setGrammar] = useState(`S -> E
E -> E + T
E -> T
T -> T * F
T -> F
F -> ( E )
F -> id`);

  const [inputString, setInputString] = useState("id + id * id");
  const [parserData, setParserData] = useState<any>(null);
  const [parsingResult, setParsingResult] = useState<any>(null);
  const [nfa, setNfa] = useState<any>(null);
  const [dfa, setDfa] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const handleBuildParser = async () => {
  setIsLoading(true);
  setError(null);
  setNfa(null);
  setDfa(null);

  try {
    // 1) Construir tabla LR(1)
    const parserResponse = await fetch("/api/run-script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        script: "lr1_parser.py",
        args: ["build", JSON.stringify({ grammar })],
      }),
    });

    const parserResult = await parserResponse.json();
    console.log("PARSER RESULT ->", parserResult);
    if (!parserResponse.ok || !parserResult.success) {
      throw new Error(parserResult.error || "Error building parser");
    }
    setParserData(parserResult);

    // 2) Construir AFN y DFA (enviar GRAMMAR, no productions)
    const automatonResponse = await fetch("/api/run-script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        script: "automaton_builder.py",
        args: ["build_both", JSON.stringify({ grammar })],
      }),
    });

    const automatonResult = await automatonResponse.json();
    console.log("AUTOMATON RESULT ->", automatonResult);

    if (!automatonResponse.ok || !automatonResult.success) {
      throw new Error(automatonResult.error || "Error construyendo AFN/DFA");
    }
    setNfa(automatonResult.nfa);
    setDfa(automatonResult.dfa);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error building parser");
    }   finally {
      setIsLoading(false);
    }
  };
  const handleParse = async () => {
    if (!parserData) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/run-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: "lr1_parser.py",
          args: ["parse", JSON.stringify({ grammar, input: inputString })],
        }),
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setParsingResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error parsing input");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Settings className="w-4 h-4" />
          Compiler Design Tool
        </div>
        <h1 className="text-4xl font-bold mb-4 text-balance">Analizador Sintáctico LR(1)</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          Herramienta completa para construir parsers LR(1), AFN y DFA. Implementado con Python backend y Next.js
          frontend.
        </p>
      </div>

      {/* Main */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Grammar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Gramática
            </CardTitle>
            <CardDescription>Define las reglas de producción de tu gramática</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GrammarInput value={grammar} onChange={setGrammar} disabled={isLoading} />
            <Button onClick={handleBuildParser} disabled={isLoading} className="w-full">
              {isLoading ? "Construyendo..." : "Construir Parser"}
            </Button>
            {parserData && (
              <Badge variant="outline" className="w-full justify-center">
                Parser LR(1) construido exitosamente
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Input */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Cadena de Entrada
            </CardTitle>
            <CardDescription>Ingresa la cadena que deseas analizar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              defaultValue="id + id * id"
              onChange={(e) => setInputString(e.target.value)}
              placeholder="Ej: id + id * id"
              disabled={isLoading || !parserData}
              className="font-mono"
            />
            <Button onClick={handleParse} disabled={isLoading || !parserData || !inputString.trim()} className="w-full">
              {isLoading ? "Analizando..." : "Analizar Cadena"}
            </Button>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {parserData && (
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table className="w-4 h-4" />
              Tabla LR(1)
            </TabsTrigger>
            <TabsTrigger value="steps" disabled={!parsingResult}>
              Pasos
            </TabsTrigger>
            <TabsTrigger value="nfa" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              AFN
            </TabsTrigger>
            <TabsTrigger value="dfa" className="flex items-center gap-2">
              <Workflow className="w-4 h-4" />
              DFA
            </TabsTrigger>
            <TabsTrigger value="comparison">Comparación</TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-6">
            <ParsingTable parserData={parserData} />
          </TabsContent>

          <TabsContent value="steps" className="mt-6">
            {parsingResult && <ParsingSteps result={parsingResult} />}
          </TabsContent>

          <TabsContent value="tree" className="mt-6">
            {parsingResult && <ParseTree result={parsingResult} />}
          </TabsContent>

          <TabsContent value="nfa" className="mt-6">
            {nfa ? (
              <AutomatonVisualizer
                automaton={nfa}
                title="Autómata Finito No Determinista (AFN)"
                description="AFN generado a partir de la gramática de entrada usando Python"
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  Construye el parser primero para generar el AFN
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="dfa" className="mt-6">
            {dfa ? (
              <AutomatonVisualizer
                automaton={dfa}
                title="Autómata Finito Determinista (DFA)"
                description="DFA obtenido mediante conversión del AFN usando construcción de subconjuntos en Python"
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  Construye el parser primero para generar el DFA
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            {nfa && dfa ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <AutomatonVisualizer automaton={nfa} title="AFN" description="Autómata No Determinista" />
                <AutomatonVisualizer automaton={dfa} title="DFA" description="Autómata Determinista" />
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  Construye el parser primero para comparar AFN y DFA
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
