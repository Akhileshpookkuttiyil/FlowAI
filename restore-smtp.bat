git reset --hard fc09830
git push origin main --force
cd backend
npm uninstall resend --legacy-peer-deps
git add .
git commit -m "cleanup: final restoration of optimized Gmail SMTP"
git push origin main --force
