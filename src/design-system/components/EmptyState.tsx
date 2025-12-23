import { Sparkles, Upload, BarChart3, Zap, Download } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

export function EmptyState() {
  const scrollToUpload = () => {
    const uploadElement = document.getElementById('upload-zone');
    if (uploadElement) {
      uploadElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const downloadSample = () => {
    // Create sample CSV data
    const sampleData = `ID,Name,Email,Sales,Region,Date
1,Customer 1,customer1@example.com,5432,North,2024-03-15
2,Customer 2,customer2@example.com,8901,South,2024-04-22
3,Customer 3,customer3@example.com,3210,East,2024-02-10
4,Customer 4,customer4@example.com,7654,West,2024-05-18
5,Customer 5,customer5@example.com,4567,North,2024-01-25`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const features = [
    {
      icon: Upload,
      title: 'Easy Upload',
      description: 'Drag & drop CSV or Excel files',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Cleaning',
      description: 'Automatic data preprocessing',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: BarChart3,
      title: 'Smart Charts',
      description: 'Generate visualizations instantly',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Zap,
      title: 'Fast Insights',
      description: 'Get AI-driven analysis',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="text-center max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-lg shadow-indigo-500/50">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Welcome to Adaptiva
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
          Transform your data into actionable insights with AI-powered analysis,
          automatic visualizations, and intelligent predictions.
        </p>
        
        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
            onClick={scrollToUpload}
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Your Data
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="border-slate-300 hover:bg-slate-50"
            onClick={downloadSample}
          >
            <Download className="w-5 h-5 mr-2" />
            Download Sample File
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-all duration-200 border-slate-200"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} mb-4 mx-auto`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500">{feature.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}