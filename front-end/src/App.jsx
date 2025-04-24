import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { PageNotFound } from "./components/PageNotFound/PageNotFound";
import { Login } from "./components/Login/Login";
import { Layout } from "./components/Layout";
import { RecuperarContrasena } from "./components/RecuperarContrasena/RecuperarContrasena";
import { AuthGuard } from "./components/Login/AuthGuard";
import PersonalData from "./components/PersonalData/PersonalData";
import { Consent } from "./components/Consent/Consent";
import { CreateConsent } from "./components/Consent/CreateConsent";
import { ConsentLogs } from "./components/Consent/ConsentLogs";
import { Transparency } from "./components/Transparency/Transparency";
import Audit from "./components/Audit/Audit";
import {Register } from "./components/Register/Register";
import {SolicitudesArco}  from "./components/PersonalData/SolicitudesArco";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register/>} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="*" element={<PageNotFound />} />

        <Route
          path="/*"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }>
          <Route path="" element={<Dashboard />} />
          
          {/* ✅ Rutas accesibles para TODOS los usuarios autenticados */}
          <Route path="personal-data" element={<PersonalData />} />
          <Route path="consent" element={<Consent />} />
          <Route path="transparency" element={<Transparency />} />

          {/* ✅ Ruta exclusiva para ADMIN_ROLE */}
          <Route
            path="audit"
            element={
              <AuthGuard allowedRoles={["ADMIN_ROLE"]}>
                <Audit />
              </AuthGuard>
            }
          />
          <Route
            path="solicitudes_arco"
            element={
              <AuthGuard allowedRoles={["ADMIN_ROLE"]}>
                <SolicitudesArco/>
              </AuthGuard>
            }
          />
          <Route
            path="create-consent"
            element={
              <AuthGuard allowedRoles={["ADMIN_ROLE"]}>
                <CreateConsent/>
              </AuthGuard>
            }
          />
          <Route
            path="consentLogs"
            element={
              <AuthGuard allowedRoles={["ADMIN_ROLE"]}>
                <ConsentLogs/>
              </AuthGuard>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
