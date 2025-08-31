import { useNavigate } from "react-router-dom";
import "./css/tailwind.css";

const LandingPage = () => {
  const handleFeatureClick = (link) => {
    console.log(`Navigate to: ${link}`);
    alert(`This would navigate to: ${link}`);
  };
  const navigate = useNavigate();
  const handleNavigatetoLogin = () => navigate("/login");

  return (
    <div className="min-h-screen flex flex-col text-gray-800 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Custom Animations and Styles */}
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes fadeUp {
            0% { opacity: 0; transform: translateY(40px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes sparkle {
            0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
            50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
          }
          .animate-fadeIn { animation: fadeIn 1.5s ease-out; }
          .animate-fadeUp { animation: fadeUp 1.2s ease-out; }
          .animate-float { animation: float 3s ease-in-out infinite; }
          .animate-gradient { animation: gradient 8s ease infinite; }
          .animate-sparkle { animation: sparkle 2s ease-in-out infinite; }
          .hero-gradient {
            background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe);
            background-size: 400% 400%;
            animation: gradient 8s ease infinite;
          }
          .text-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .feature-card:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          }
        `}
      </style>

      {/* ✅ Logo */}
      <div className="absolute top-6 left-8 right-8 flex justify-between items-center z-50">
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-white drop-shadow-lg">
          AURASPHERE
        </h1>
        <button 
          onClick={() => handleNavigatetoLogin()}
          className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-semibold hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Login
        </button>
      </div>

      {/* ✅ Hero Section */}
      <header className="h-screen flex flex-col justify-center items-center text-center relative overflow-hidden hero-gradient">
        {/* Floating Sparkles */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-white rounded-full animate-sparkle"></div>
        <div
          className="absolute top-40 right-32 w-6 h-6 bg-white rounded-full animate-sparkle"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-16 w-3 h-3 bg-white rounded-full animate-sparkle"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Hero Content */}
        <div className="relative z-10 text-white max-w-4xl px-6">
          <div className="mb-8 animate-fadeIn">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm border border-white/30 text-sm font-medium mb-6">
              ✨ Welcome to the Future of Productivity
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-black mb-8 animate-fadeIn leading-tight">
            Empower Your
            <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
              Productivity
            </span>
          </h1>

          <p className="text-xl md:text-2xl opacity-95 animate-fadeUp leading-relaxed mb-10 font-light">
            Manage goals, events, attendance, and virtual classrooms in one
            <br />
            <span className="font-medium">beautifully designed platform</span>
          </p>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg
            className="relative block w-full h-32 transform scale-110"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
          >
            <path
              fill="#fff"
              d="M0,128L48,154.7C96,181,192,235,288,224C384,213,480,139,576,106.7C672,75,768,85,864,96C960,107,1056,117,1152,144C1248,171,1344,213,1392,234.7L1440,256V320H0Z"
            ></path>
          </svg>
        </div>
      </header>

      {/* ✅ Features Section */}
      <main className="py-24 px-6 max-w-7xl mx-auto bg-gradient-to-b from-white to-slate-50">
        <section className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6 animate-fadeIn">
            🚀 Powerful Features
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-gradient animate-fadeUp">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fadeUp">
            Discover tools to stay organized, motivated, and achieve your goals
            with ease.
          </p>
        </section>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Dashboard",
              desc: "Get a complete overview of your progress with beautiful analytics.",
              icon: "📊",
              gradient: "from-blue-500 to-purple-600",
              bgPattern: "bg-gradient-to-br from-blue-50 to-purple-50",
            },
            {
              title: "Goals Management",
              desc: "Track and achieve your personal goals effortlessly.",
              icon: "🎯",
              gradient: "from-green-500 to-teal-600",
              bgPattern: "bg-gradient-to-br from-green-50 to-teal-50",
            },
            {
              title: "Events",
              desc: "Stay updated with upcoming events and activities.",
              icon: "📅",
              gradient: "from-orange-500 to-red-600",
              bgPattern: "bg-gradient-to-br from-orange-50 to-red-50",
            },
            {
              title: "Attendance",
              desc: "Track your attendance and ensure active participation.",
              icon: "✅",
              gradient: "from-emerald-500 to-green-600",
              bgPattern: "bg-gradient-to-br from-emerald-50 to-green-50",
            },
            {
              title: "Leaderboard",
              desc: "See how you rank among others and stay motivated.",
              icon: "🏆",
              gradient: "from-yellow-500 to-orange-600",
              bgPattern: "bg-gradient-to-br from-yellow-50 to-orange-50",
            },
            {
              title: "Virtual Classroom",
              desc: "Join interactive sessions and collaborate in real-time.",
              icon: "🎥",
              gradient: "from-indigo-500 to-purple-600",
              bgPattern: "bg-gradient-to-br from-indigo-50 to-purple-50",
            },
          ].map((feature, index) => (
            <div
              key={index}
              onClick={handleNavigatetoLogin}
              className={`feature-card relative p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 animate-fadeUp border border-gray-100 text-center overflow-hidden cursor-pointer ${feature.bgPattern}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Hover Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 hover:opacity-10 transition-opacity duration-500`}
              ></div>

              {/* Icon */}
              <div className="text-6xl mb-6 animate-float">{feature.icon}</div>
              <h3
                className={`text-2xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent mb-4`}
              >
                {feature.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* ✅ Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 text-center py-12 mt-24">
        <div className="max-w-4xl mx-auto px-6">
          <h4 className="text-3xl font-bold text-white mb-2">AURASPHERE</h4>
          <p className="text-gray-400">
            Empowering productivity, one goal at a time.
          </p>
          <div className="border-t border-gray-700 pt-6 mt-6">
            <p>
              &copy; 2024 AURASPHERE. All rights reserved. Made with ❤️ for
              productivity enthusiasts.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;