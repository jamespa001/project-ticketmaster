'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface TestCase {
  fullName: string;
  title: string;
  status: 'passed' | 'failed' | 'skipped';
}

interface TestFileResult {
  name: string;
  status: string;
  assertionResults: TestCase[];
}

interface TestReport {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  success: boolean;
  startTime: number;
  testResults: TestFileResult[];
}

function CircularProgress({
  percentage,
  label,
}: {
  percentage: number;
  label: string;
}) {
  const [progress, setProgress] = useState(0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, 200);
    return () => clearTimeout(timer);
  }, [percentage]);

  let strokeColor = 'text-emerald-500';
  if (percentage < 70) {
    strokeColor = 'text-red-500';
  } else if (percentage < 90) {
    strokeColor = 'text-amber-500';
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center shadow-xl">
      <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="text-slate-800"
            strokeWidth="2"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`transition-all duration-1000 ease-out ${strokeColor}`}
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>
      <h3 className="mt-4 sm:mt-6 text-xs sm:text-base font-bold text-gray-200 uppercase tracking-wider text-center">
        {label}
      </h3>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [report, setReport] = useState<TestReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [email, setEmail] = useState('admin@tmclone.com');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [openTiers, setOpenTiers] = useState<Record<string, boolean>>({
    BVT: false,
    P0: false,
    P1: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data()?.role === 'admin') {
          setIsAdmin(true);
          const res = await fetch('/reports/test-results/latest.json');
          if (!res.ok)
            throw new Error('No test report found. Run "npm run test" first!');
          const data = await res.json();
          setReport(data);
        } else {
          setIsAdmin(false);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  // Loading Spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-gray-400 tracking-wide">
          Verifying admin access...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl max-w-md w-full shadow-2xl">
          <h1 className="text-2xl font-bold text-red-400 mb-2 text-center">
            Admin Access Restricted
          </h1>
          <p className="text-gray-300 text-sm mb-6 text-center">
            Please log in with the administrator account (
            <code className="text-sky-400">admin@tmclone.com</code>) to view
            administrative metrics.
          </p>

          <form onSubmit={handleDemoLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>
            {loginError && <p className="text-xs text-red-400">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold py-2.5 rounded transition-colors"
            >
              Sign In as Admin
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              ← Return to Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <div className="p-4 sm:p-8 text-white bg-slate-950 min-h-screen">
        <h1 className="text-2xl font-bold text-red-400 mb-4">
          Ticketmaster Admin
        </h1>
        <p className="text-gray-300">{error || 'Failed to load report.'}</p>
        <p className="text-sm text-gray-500 mt-2">
          Tip: Run{' '}
          <code className="bg-slate-900 px-2 py-1 rounded text-gray-200">
            npm run test
          </code>{' '}
          to generate the report.
        </p>
      </div>
    );
  }

  const tiers: Record<string, { tests: TestCase[]; priorityLabel: string }> = {
    BVT: { tests: [], priorityLabel: 'BVT' },
    P0: { tests: [], priorityLabel: 'P0' },
    P1: { tests: [], priorityLabel: 'P1' },
  };

  report.testResults.forEach((file) => {
    file.assertionResults.forEach((test) => {
      const full = (test.fullName || test.title).toUpperCase();
      if (full.includes('[BVT]')) {
        tiers.BVT.tests.push(test);
      } else if (full.includes('[P0]')) {
        tiers.P0.tests.push(test);
      } else if (full.includes('[P1]')) {
        tiers.P1.tests.push(test);
      }
    });
  });

  const calculatePassRate = (tests: TestCase[]) => {
    if (tests.length === 0) return 100;
    const passed = tests.filter((t) => t.status === 'passed').length;
    return (passed / tests.length) * 100;
  };

  const toggleTier = (tierKey: string) => {
    setOpenTiers((prev) => ({ ...prev, [tierKey]: !prev[tierKey] }));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header with Scalable Title & Subtitle Hierarchy */}
        <header className="mb-8 border-b border-slate-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-5">
            Ticketmaster Admin
          </h1>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-sky-400 text-xs sm:text-sm font-medium">
              Test Matrix & Quality Assurance Monitoring
            </p>
            <div className="sm:text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  report.success
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {report.success ? 'Build Healthy' : 'Build Failing'}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Last Run: {new Date(report.startTime).toLocaleString()}
              </p>
            </div>
          </div>
        </header>

        {/* Circular Progress Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <CircularProgress
            percentage={calculatePassRate(tiers.BVT.tests)}
            label="BVT (Build Verification)"
          />
          <CircularProgress
            percentage={calculatePassRate(tiers.P0.tests)}
            label="P0 (Critical Paths)"
          />
          <CircularProgress
            percentage={calculatePassRate(tiers.P1.tests)}
            label="P1 (Core Features)"
          />
        </div>

        {/* Collapsible Responsive Tables/Cards */}
        <div className="space-y-6">
          {Object.entries(tiers).map(([key, { tests, priorityLabel }]) => {
            const passRate = Math.round(calculatePassRate(tests));
            const passedCount = tests.filter(
              (t) => t.status === 'passed',
            ).length;
            const isOpen = openTiers[key];

            return (
              <div
                key={key}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleTier(key)}
                  className="w-full flex justify-between items-center p-4 sm:p-5 bg-slate-900 hover:bg-slate-850 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    <span className="px-2 sm:px-2.5 py-1 rounded bg-slate-800 text-sky-400 font-mono text-xs font-bold shrink-0">
                      {priorityLabel}
                    </span>
                    <h2 className="text-base sm:text-lg font-semibold text-white truncate">
                      Tier {key} Suite{' '}
                      <span className="text-xs sm:text-sm font-normal text-indigo-400 font-semibold ml-1 sm:ml-2">
                        ({passedCount}/{tests.length} passed — {passRate}%)
                      </span>
                    </h2>
                  </div>
                  <span
                    className={`transform transition-transform duration-200 text-gray-400 shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
                  >
                    ▼
                  </span>
                </button>

                {/* Collapsible Content */}
                {isOpen && (
                  <div className="border-t border-slate-800">
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-950/60 text-gray-400 text-xs uppercase tracking-wider border-b border-slate-800">
                            <th className="py-3 px-6 font-semibold w-24">
                              Priority
                            </th>
                            <th className="py-3 px-6 font-semibold">
                              Description
                            </th>
                            <th className="py-3 px-6 font-semibold w-36">
                              DevName
                            </th>
                            <th className="py-3 px-6 font-semibold w-28">
                              Pass/Fail
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-sm">
                          {tests.map((test, index) => (
                            <tr
                              key={index}
                              className="hover:bg-slate-850/50 transition-colors"
                            >
                              <td className="py-3 px-6 font-mono text-xs text-sky-400 font-semibold">
                                {priorityLabel}
                              </td>
                              <td
                                className="py-3 px-6 text-gray-300 break-words max-w-xl"
                                title={test.fullName || test.title}
                              >
                                {test.fullName || test.title}
                              </td>
                              <td className="py-3 px-6 text-gray-400 text-xs font-mono">
                                James Park
                              </td>
                              <td className="py-3 px-6">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    test.status === 'passed'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  }`}
                                >
                                  {test.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {tests.length === 0 && (
                            <tr>
                              <td
                                colSpan={4}
                                className="py-6 text-center text-gray-500 italic text-sm"
                              >
                                No tests found in this tier.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="block md:hidden divide-y divide-slate-800/80">
                      {tests.map((test, index) => (
                        <div
                          key={index}
                          className="p-4 space-y-2 bg-slate-900/40"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-sky-400 font-bold bg-slate-800/80 px-2 py-0.5 rounded">
                              {priorityLabel}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                test.status === 'passed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}
                            >
                              {test.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-200 leading-relaxed break-words font-medium">
                            {test.fullName || test.title}
                          </p>
                          <div className="text-[11px] text-gray-500 font-mono">
                            Dev: James Park
                          </div>
                        </div>
                      ))}
                      {tests.length === 0 && (
                        <div className="p-4 text-center text-gray-500 italic text-xs">
                          No tests found in this tier.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
