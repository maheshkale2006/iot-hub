import { Link } from "react-router-dom"

function Footer() {
  return (
    <footer className="bg-[#0f172b] text-[#8fa9c9]">

      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 px-4 py-[54px] md:grid-cols-4 lg:px-0">

        {/* BRAND */}

        <div>

          <Link
            to="/"
            className="flex items-center gap-2"
          >

            <span className="grid h-9 w-9 place-items-center rounded-[9px] bg-[#0ea5e9]">
              <span className="text-lg text-white">
                ▦
              </span>
            </span>

            <span className="text-[20px] font-extrabold text-white">
              IoT<span className="text-[#0ea5e9]">Hub</span>
            </span>

          </Link>

          <p className="mt-5 max-w-[280px] text-[14px] leading-6">
            Find Components. Learn Projects. Build Faster.
            Your one-stop IoT marketplace and learning platform.
          </p>

        </div>

        {/* PRODUCTS */}

        <div>

          <h3 className="text-[13px] font-bold text-white">
            IoT Products
          </h3>

          <div className="mt-4 space-y-2 text-[14px]">
            <p>Arduino Boards</p>
            <p>ESP32 Modules</p>
            <p>ESP8266</p>
            <p>Sensors</p>
            <p>Relay Modules</p>
            <p>Motors &amp; Servos</p>
            <p>Displays</p>
            <p>Communication</p>
          </div>

        </div>

        {/* PROJECTS */}

        <div>

          <h3 className="text-[13px] font-bold text-white">
            IoT Projects
          </h3>

          <div className="mt-4 space-y-2 text-[14px]">
            <p>Smart Home</p>
            <p>Agriculture</p>
            <p>Security Systems</p>
            <p>Weather Station</p>
            <p>Robotics</p>
            <p>Healthcare</p>
            <p>College Projects</p>
            <p>Beginner Projects</p>
          </div>

        </div>

        {/* SUPPORT */}

        <div>

          <h3 className="text-[13px] font-bold text-white">
            Support
          </h3>

          <div className="mt-4 space-y-2 text-[14px]">
            <p>Contact Us</p>
            <p>FAQs</p>
            <p>Shipping Info</p>
            <p>Return Policy</p>
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
          </div>

          <div className="mt-5 rounded-[13px] bg-[#1d2b43] p-3 text-[12px]">

            <div className="font-medium text-white">
              📧 Email Support
            </div>

            <div className="mt-1 text-[#21b7ef]">
              support@iothub.in
            </div>

            <div className="mt-2 font-medium text-white">
              📞 Phone
            </div>

            <div className="mt-1 text-[#21b7ef]">
              +91 98765 43210
            </div>

          </div>

        </div>

      </div>

      <div className="mx-auto flex max-w-[1240px] flex-col gap-3 border-t border-white/10 px-4 py-6 text-[12px] md:flex-row md:items-center md:justify-between lg:px-0">

        <span>
          © 2024 IoTHub. Made with ❤️ in India.
          All rights reserved.
        </span>

        <span>
          🔒 Secure Payments
          &nbsp;&nbsp;&nbsp;
          🚚 Fast Delivery
        </span>

      </div>

    </footer>
  )
}

export default Footer