import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MCPSearchResult {
  success: boolean;
  tool: string;
  data: {
    results: any[];
    totalCount: number;
    page: number;
    limit: number;
  };
  query?: any;
  options?: any;
}

interface MCPSearchFilters {
  searchQuery?: string;
  selectedLocation?: string;
  selectedPropertyType?: 'residential' | 'commercial' | 'land';
  selectedSubType?: string;
  selectedBHK?: string;
  selectedPriceRange?: string;
  transactionType?: 'rent' | 'sale';
}

export default function MCPSearchPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MCPSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mcpServerStatus, setMcpServerStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<MCPSearchFilters>({
    searchQuery: '',
    selectedLocation: '',
    selectedPropertyType: undefined,
    selectedSubType: '',
    selectedBHK: '',
    selectedPriceRange: '',
    transactionType: undefined
  });

  const [searchType, setSearchType] = useState<'property_search' | 'nlp_property_search' | 'get_property_by_code' | 'search_suggestions' | 'latest_properties'>('property_search');

  // Temporary direct btService integration for testing
  const executeMCPTool = async (toolName: string, args: any): Promise<MCPSearchResult> => {
    try {
      let btServiceUrl = '';
      let btServiceBody: any = {};

      // Map MCP tools to btService endpoints
      switch (toolName) {
        case 'property_search':
          btServiceUrl = `${import.meta.env.VITE_BTSERVICE_URL}/api/search`;
          btServiceBody = args;
          break;
        case 'nlp_property_search':
          btServiceUrl = `${import.meta.env.VITE_BTSERVICE_URL}/api/search/nlp`;
          btServiceBody = { query: args.query };
          break;
        case 'get_property_by_code':
          btServiceUrl = `${import.meta.env.VITE_BTSERVICE_URL}/api/search/code/${args.propertyCode}`;
          btServiceBody = {};
          break;
        case 'search_suggestions':
          btServiceUrl = `${import.meta.env.VITE_BTSERVICE_URL}/api/search/suggestions?query=${encodeURIComponent(args.query)}`;
          btServiceBody = {};
          break;
        case 'latest_properties':
          btServiceUrl = `${import.meta.env.VITE_BTSERVICE_URL}/api/search/latest?limit=${args.limit || 20}&offset=${args.offset || 0}`;
          btServiceBody = {};
          break;
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }

      const method = toolName === 'get_property_by_code' || toolName === 'search_suggestions' || toolName === 'latest_properties' ? 'GET' : 'POST';
      
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method === 'POST') {
        fetchOptions.body = JSON.stringify(btServiceBody);
      }

      const response = await fetch(btServiceUrl, fetchOptions);

      if (!response.ok) {
        throw new Error(`btService call failed: ${response.statusText}`);
      }

      const btServiceResult = await response.json();

      // Transform btService response to MCP format
      return {
        success: btServiceResult.success || true,
        tool: toolName,
        data: btServiceResult.data || btServiceResult,
        query: args,
        options: args.options
      };
    } catch (error) {
      throw new Error(`Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const checkMCPServerStatus = async () => {
    try {
      // For now, check btService directly since we're bypassing MCP
      const response = await fetch(`${import.meta.env.VITE_BTSERVICE_URL}/api/health`);
      if (response.ok) {
        setMcpServerStatus('connected');
      } else {
        setMcpServerStatus('disconnected');
      }
    } catch (error) {
      setMcpServerStatus('disconnected');
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      let args: any = {};

      switch (searchType) {
        case 'property_search':
          args = {
            filters: filters,
            options: {
              page: 1,
              limit: 20,
              sortBy: 'created_at',
              sortOrder: 'desc'
            }
          };
          break;
        case 'nlp_property_search':
          args = {
            query: filters.searchQuery || ''
          };
          break;
        case 'get_property_by_code':
          args = {
            propertyCode: filters.searchQuery || ''
          };
          break;
        case 'search_suggestions':
          args = {
            query: filters.searchQuery || ''
          };
          break;
        case 'latest_properties':
          args = {
            limit: 20,
            offset: 0
          };
          break;
      }

      const result = await executeMCPTool(searchType, args);
      setResults(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof MCPSearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  React.useEffect(() => {
    checkMCPServerStatus();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">MCP Search Integration</h1>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            {mcpServerStatus === 'connected' && (
              <><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-sm text-green-700">btService Connected</span></>
            )}
            {mcpServerStatus === 'disconnected' && (
              <><AlertCircle className="w-4 h-4 text-red-500" /><span className="text-sm text-red-700">btService Disconnected</span></>
            )}
            {mcpServerStatus === 'unknown' && (
              <><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm text-gray-500">Checking btService...</span></>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={checkMCPServerStatus}>
            Refresh Status
          </Button>
        </div>
      </div>

      {/* Search Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Search Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="searchType">Search Tool</Label>
              <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select search tool" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="property_search">Property Search</SelectItem>
                  <SelectItem value="nlp_property_search">NLP Property Search</SelectItem>
                  <SelectItem value="get_property_by_code">Get Property By Code</SelectItem>
                  <SelectItem value="search_suggestions">Search Suggestions</SelectItem>
                  <SelectItem value="latest_properties">Latest Properties</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="searchQuery">Search Query</Label>
              <Input
                id="searchQuery"
                placeholder="Enter search query..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              />
            </div>

            {searchType === 'property_search' && (
              <>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter location..."
                    value={filters.selectedLocation}
                    onChange={(e) => handleFilterChange('selectedLocation', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select value={filters.selectedPropertyType} onValueChange={(value: any) => handleFilterChange('selectedPropertyType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bhk">BHK</Label>
                  <Select value={filters.selectedBHK} onValueChange={(value: any) => handleFilterChange('selectedBHK', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select BHK" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 BHK</SelectItem>
                      <SelectItem value="2">2 BHK</SelectItem>
                      <SelectItem value="3">3 BHK</SelectItem>
                      <SelectItem value="4">4 BHK</SelectItem>
                      <SelectItem value="5+">5+ BHK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="transactionType">Transaction Type</Label>
                  <Select value={filters.transactionType} onValueChange={(value: any) => handleFilterChange('transactionType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="sale">Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <Button 
            onClick={handleSearch} 
            disabled={isLoading || mcpServerStatus !== 'connected'}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Execute MCP Search
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Tool: {results.tool}</span>
                <span>Total Results: {results.data.totalCount}</span>
              </div>
              
              {results.success ? (
                <div className="space-y-2">
                  {results.data.results.length > 0 ? (
                    <div className="grid gap-4">
                      {results.data.results.map((result: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                          <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No results found
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-red-800">
                      Search failed. Please check the MCP server connection and try again.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>MCP Server Status:</strong> {mcpServerStatus}</div>
            <div><strong>Selected Tool:</strong> {searchType}</div>
            <div><strong>Current Filters:</strong></div>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(filters, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}