import React, { useState, useEffect, useCallback } from 'react';
import { AspectRatio, LightingStyle, CameraPerspective } from './types';
import { ASPECT_RATIO_OPTIONS, LIGHTING_STYLE_OPTIONS, CAMERA_PERSPECTIVE_OPTIONS } from './constants';
import { fileToBase64, formatImageWithAspectRatio } from './utils/fileUtils';
import { generateImageWithNano, describeImageStyle, generatePromptSuggestions } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import SelectControl from './components/SelectControl';
import { SparklesIcon, LoadingSpinner, ImageIcon, PencilIcon, DownloadIcon } from './components/icons';

const App: React.FC = () => {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [styleImage, setStyleImage] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [lightingStyle, setLightingStyle] = useState<LightingStyle>(LightingStyle.STUDIO);
  const [cameraPerspective, setCameraPerspective] = useState<CameraPerspective>(CameraPerspective.EYE_LEVEL);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPromptLoading, setIsPromptLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updatePromptAndSuggestions = async () => {
      setIsPromptLoading(true);
      setPromptSuggestions([]);
      
      let styleDescription = '';
      if (styleImage) {
        try {
          const styleB64 = await fileToBase64(styleImage);
          styleDescription = await describeImageStyle(styleB64);
        } catch (err: any) {
          console.error("Failed to describe style image:", err);
          setError("Could not analyze style image. Using fallback prompts.");
          styleDescription = ''; // Reset on error
        }
      }

      try {
        const suggestions = await generatePromptSuggestions({
            aspectRatio,
            lightingStyle,
            cameraPerspective,
            styleDescription
        });
        setPromptSuggestions(suggestions);
        if (suggestions.length > 0) {
            setGeneratedPrompt(suggestions[0]); // Set the first suggestion as the default
        }
      } catch (err: any) {
        console.error("Failed to generate prompt suggestions:", err);
        setError("Could not generate prompt suggestions.");
      } finally {
        setIsPromptLoading(false);
      }
    };

    updatePromptAndSuggestions();
  }, [aspectRatio, lightingStyle, cameraPerspective, styleImage]);

  const handleGenerateImage = useCallback(async () => {
    if (!productImage) {
      setError("Please upload a product image first.");
      return;
    }
    if (!generatedPrompt) {
        setError("Please select or write a prompt.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const productB64 = await formatImageWithAspectRatio(productImage, aspectRatio);
      const styleB64 = styleImage ? await fileToBase64(styleImage) : null;
      
      const resultImageUrl = await generateImageWithNano(productB64, generatedPrompt, styleB64);
      setGeneratedImage(resultImageUrl);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [productImage, styleImage, generatedPrompt, aspectRatio]);

  const handleDownloadImage = useCallback(() => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'ai-photo-studio-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImage]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-xl mx-auto">
        <header className="text-center mb-10">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                AI Photo Studio
            </h1>
            <p className="mt-3 text-lg text-[rgb(var(--color-text-secondary))]">Transform your product photos with a single click</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            
            <div className="lg:col-span-3 flex flex-col gap-6">
                 <ImageUploader 
                    title="1. Product Photo" 
                    subtitle="Upload the main subject" 
                    onImageChange={setProductImage} 
                />
                <ImageUploader 
                    title="2. Style Reference (Optional)" 
                    subtitle="Upload an image for style" 
                    onImageChange={setStyleImage} 
                />
            </div>
          
            <div className="lg:col-span-4 bg-white/5 border border-[rgb(var(--color-subtle))] rounded-xl p-6 flex flex-col space-y-5">
              <h2 className="text-xl font-bold text-white">3. Customize Style</h2>
              <SelectControl label="Aspect Ratio" value={aspectRatio} options={ASPECT_RATIO_OPTIONS} onChange={(v) => setAspectRatio(v as AspectRatio)} />
              <SelectControl label="Lighting Style" value={lightingStyle} options={LIGHTING_STYLE_OPTIONS} onChange={(v) => setLightingStyle(v as LightingStyle)} />
              <SelectControl label="Camera Perspective" value={cameraPerspective} options={CAMERA_PERSPECTIVE_OPTIONS} onChange={(v) => setCameraPerspective(v as CameraPerspective)} />
              
              <div className="flex-grow flex flex-col">
                <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2 flex items-center">
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Prompt
                </label>
                <textarea 
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  className="w-full flex-grow min-h-[100px] bg-[rgb(var(--color-subtle))] border border-[rgb(var(--color-subtle))] text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-[rgb(var(--color-accent))] focus:border-[rgb(var(--color-accent))] transition"
                  placeholder="Prompt will be generated here..."
                />
              </div>
              
              <div className="mt-1">
                <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2 flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  Prompt Suggestions
                </label>
                {isPromptLoading ? (
                  <div className="flex items-center justify-center h-24 bg-[rgb(var(--color-subtle))] rounded-lg">
                    <div className="flex items-center text-sm text-[rgb(var(--color-text-main))]">
                      <LoadingSpinner className="h-4 w-4 mr-2" />
                      Generating creative ideas...
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    {promptSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setGeneratedPrompt(suggestion)}
                        className="w-full text-left text-sm text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-subtle))] p-2.5 rounded-lg hover:bg-[rgb(var(--color-subtle))]/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col gap-6">
                <div className="bg-white/5 border border-[rgb(var(--color-subtle))] rounded-xl p-6 flex-grow flex flex-col">
                  <h2 className="text-xl font-bold text-white mb-4">4. Result</h2>
                    <div className="flex-grow bg-black/20 rounded-lg flex items-center justify-center p-2 min-h-[300px] lg:min-h-0">
                        {isLoading && (
                            <div className="text-center text-[rgb(var(--color-text-secondary))]">
                                <LoadingSpinner className="h-10 w-10 mx-auto text-[rgb(var(--color-accent))]" />
                                <p className="mt-4 font-medium animate-pulse">AI is crafting your image...</p>
                            </div>
                        )}
                        {error && !isLoading &&(
                            <div className="text-center text-red-300 p-4 bg-red-500/10 rounded-lg">
                                <p className="font-semibold">Generation Failed</p>
                                <p className="text-sm mt-1">{error}</p>
                            </div>
                        )}
                        {!isLoading && !error && generatedImage && (
                            <img src={generatedImage} alt="Generated result" className="object-contain max-h-full max-w-full rounded-md" />
                        )}
                        {!isLoading && !error && !generatedImage && (
                            <div className="text-center text-[rgb(var(--color-muted))]">
                                <ImageIcon className="h-12 w-12 mx-auto" />
                                <p className="mt-4 font-medium">Your image will appear here</p>
                            </div>
                        )}
                    </div>
                    {generatedImage && !isLoading && !error && (
                        <button
                            onClick={handleDownloadImage}
                            className="mt-4 w-full flex items-center justify-center bg-green-600/80 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 focus:ring-4 focus:ring-green-500/50"
                        >
                            <DownloadIcon className="h-5 w-5 mr-2" />
                            Download Image
                        </button>
                    )}
                </div>
                <button 
                  onClick={handleGenerateImage}
                  disabled={isLoading || isPromptLoading || !productImage}
                  className="w-full flex items-center justify-center bg-[rgb(var(--color-accent))] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-opacity-90 disabled:bg-[rgb(var(--color-muted))] disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-[rgb(var(--color-accent))]/20 hover:shadow-[rgb(var(--color-accent))]/30 hover:shadow-xl focus:ring-4 focus:ring-[rgb(var(--color-accent))]/50"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="h-5 w-5 mr-3" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-5 w-5 mr-3" />
                      Generate Image
                    </>
                  )}
                </button>
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;
