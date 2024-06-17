import ayonClient from '/src/ayon'
import axios from 'axios'
import { ErrorBoundary } from 'react-error-boundary'
import { useEffect, useState, Suspense, lazy, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6'
import { toast } from 'react-toastify'

import Header from './containers/header'
import LoginPage from './pages/LoginPage'
import ErrorPage from './pages/ErrorPage'

const ProjectPage = lazy(() => import('./pages/ProjectPage'))
const ProjectManagerPage = lazy(() => import('./pages/ProjectManagerPage'))
const ExplorerPage = lazy(() => import('./pages/ExplorerPage'))
const APIDocsPage = lazy(() => import('./pages/APIDocsPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const UserDashboardPage = lazy(() => import('./pages/UserDashboardPage'))
const PasswordResetPage = lazy(() => import('./pages/PasswordResetPage'))

import { login } from './features/user'
import ProtectedRoute from './containers/ProtectedRoute'
import ShareDialog from './components/ShareDialog'
import ErrorFallback from './components/ErrorFallback'
import { useLazyGetInfoQuery } from './services/auth/getAuth'
import { ContextMenuProvider } from './context/contextMenuContext'
import { ShortcutsProvider } from './context/shortcutsContext'
import { GlobalContextMenu } from './components/GlobalContextMenu'
import LoadingPage from './pages/LoadingPage'
import { ConfirmDialog } from 'primereact/confirmdialog'
import OnBoardingPage from './pages/OnBoarding'
import useTooltip from './hooks/Tooltip/useTooltip'
import MarketPage from './pages/MarketPage'
import { RestartProvider } from './context/restartContext'
import { PasteProvider, PasteModal } from './context/pasteContext'
import FileUploadPreview from './containers/FileUploadPreview/FileUploadPreview'
import PreviewDialog from './containers/Preview/PreviewDialog'
import InboxPage from './pages/InboxPage'
import { URIProvider } from './context/uriContext'
import Favicon from './components/Favicon/Favicon'
import { NotificationsProvider } from './context/notificationsContext'

const App = () => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(false)
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [noAdminUser, setNoAdminUser] = useState(false)

  const storedAccessToken = localStorage.getItem('accessToken')
  
  // we still need to have the accessToken in localStorage because of 
  // the way websocket authentication works

  // extract access token from accessToken cookie
  // const cookies = document.cookie.split(';')
  // const accessTokenCookie = (cookies || []).find((cookie) => cookie.includes('accessToken'))
  // const storedAccessToken = accessTokenCookie?.split('=')[1]

  if (storedAccessToken) {
    document.cookie = `accessToken=${storedAccessToken}; path=/; max-age=86400`
  }
  axios.defaults.headers.common['X-Sender'] = window.senderId

  // Call /api/info to check whether the user is logged in
  // and to acquire server settings
  const [getInfo] = useLazyGetInfoQuery()

  useEffect(() => {
    setLoading(true)
    getInfo()
      .unwrap()
      .then((response) => {
        setNoAdminUser(!!response.noAdminUser)

        if (response.onboarding) {
          setIsOnboarding(true)
        } else {
          setIsOnboarding(false)
        }

        if (response.user) {
          dispatch(
            login({
              user: response.user,
              accessToken: storedAccessToken,
            }),
          )

          if (!response.attributes.length) {
            toast.error('Unable to load attributes. Something is wrong')
          }

          ayonClient.settings = {
            attributes: response.attributes,
            sites: response.sites,
            version: response.version,
          }

          // extend stored cookie validity
          document.cookie = `accessToken=${storedAccessToken}; path=/; max-age=86400`
        }
      })
      .catch((err) => {
        console.error(err)
        setServerError(err?.status)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [dispatch, storedAccessToken, isOnboarding])

  const [handleMouse, tooltipComponent] = useTooltip()

  useEffect(() => {
    const root = document.getElementById('root')
    const portal = document.body.lastElementChild

    // attach mouseOver event listener to root element
    root.addEventListener('mouseover', handleMouse)

    if (portal) {
      portal.addEventListener('mouseover', handleMouse)
    }

    // cleanup
    return () => {
      root.removeEventListener('mouseover', handleMouse)
      if (portal) {
        portal.removeEventListener('mouseover', handleMouse)
      }
    }
  }, [])

  const isUser = user?.data?.isUser

  // DEFINE ALL HIGH LEVEL COMPONENT PAGES HERE
  const mainComponent = useMemo(
    () => (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Favicon />
        <Suspense fallback={<LoadingPage />}>
          <RestartProvider>
            <ContextMenuProvider>
              <GlobalContextMenu />
              <PasteProvider>
                <PasteModal />
                <BrowserRouter>
                  <NotificationsProvider>
                    <URIProvider>
                      <ShortcutsProvider>
                        <QueryParamProvider
                          adapter={ReactRouter6Adapter}
                          options={{
                            updateType: 'replaceIn',
                          }}
                        >
                          <Header />
                          <ShareDialog />
                          <PreviewDialog />
                          <ConfirmDialog />
                          <FileUploadPreview />
                          <Routes>
                            <Route
                              path="/"
                              exact
                              element={<Navigate replace to="/dashboard/tasks" />}
                            />
                            <Route
                              path="/manageProjects"
                              exact
                              element={<Navigate replace to="/manageProjects/anatomy" />}
                            />

                            <Route
                              path="/dashboard"
                              element={<Navigate replace to="/dashboard/tasks" />}
                            />
                            <Route
                              path="/dashboard/:module"
                              exact
                              element={<UserDashboardPage />}
                            />

                            <Route
                              path="/manageProjects/:module"
                              element={<ProjectManagerPage />}
                            />
                            <Route
                              path={'/projects/:projectName/:module'}
                              element={<ProjectPage />}
                            />
                            <Route
                              path={'/projects/:projectName/addon/:addonName'}
                              element={<ProjectPage />}
                            />
                            <Route
                              path="/settings"
                              exact
                              element={<Navigate replace to="/settings/anatomyPresets" />}
                            />
                            <Route path="/settings/:module" exact element={<SettingsPage />} />
                            <Route
                              path="/settings/addon/:addonName"
                              exact
                              element={<SettingsPage />}
                            />
                            <Route
                              path="/services"
                              element={
                                <ProtectedRoute isAllowed={!isUser} redirectPath="/">
                                  <ServicesPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/market"
                              element={
                                <ProtectedRoute isAllowed={!isUser} redirectPath="/">
                                  <MarketPage />
                                </ProtectedRoute>
                              }
                            />

                            <Route path="/inbox/:module" exact element={<InboxPage />} />
                            <Route
                              path="/inbox"
                              exact
                              element={<Navigate to="/inbox/important" />}
                            />

                            <Route path="/explorer" element={<ExplorerPage />} />
                            <Route path="/doc/api" element={<APIDocsPage />} />
                            <Route
                              path="/account"
                              exact
                              element={<Navigate replace to="/account/profile" />}
                            />
                            <Route path="/account/:module" exact element={<AccountPage />} />
                            <Route path="/events" element={<EventsPage />} />
                            <Route element={<ErrorPage code="404" />} />
                          </Routes>
                        </QueryParamProvider>
                      </ShortcutsProvider>
                    </URIProvider>
                  </NotificationsProvider>
                </BrowserRouter>
              </PasteProvider>
            </ContextMenuProvider>
          </RestartProvider>
        </Suspense>
      </ErrorBoundary>
    ),
    [isUser],
  )

  const loadingComponent = useMemo(() => <LoadingPage />, [])

  const loginComponent = useMemo(() => <LoginPage isFirstTime={isOnboarding} />, [isOnboarding])

  const errorComponent = useMemo(
    () => <ErrorPage code={serverError} message="Server connection failed" />,
    [serverError],
  )

  const onboardingComponent = useMemo(
    () => (
      <BrowserRouter>
        <QueryParamProvider
          adapter={ReactRouter6Adapter}
          options={{
            updateType: 'replaceIn',
          }}
        >
          <OnBoardingPage
            noAdminUser={noAdminUser}
            onFinish={() => setIsOnboarding(false)}
            isOnboarding={isOnboarding || noAdminUser}
          />
        </QueryParamProvider>
      </BrowserRouter>
    ),
    [isOnboarding, noAdminUser],
  )

  // Then use the state of the app to determine which component to render

  if (loading) return loadingComponent

  if (window.location.pathname.startsWith('/passwordReset')) {
    if (!user.name) return <PasswordResetPage />
    else window.history.replaceState({}, document.title, '/')
  }

  // User is not logged in
  if (!user.name && !noAdminUser) {
    return (
      <>
        {loginComponent}
        {tooltipComponent}
      </>
    )
  }

  if (isOnboarding || noAdminUser) {
    return (
      <>
        {onboardingComponent}
        {tooltipComponent}
      </>
    )
  }

  if (window.location.pathname.startsWith('/login')) {
    // already logged in, but stuck on the login page
    window.history.replaceState({}, document.title, '/')
    return isOnboarding ? null : loadingComponent
  }

  // stuck on onboarding page
  if (window.location.pathname.startsWith('/onboarding')) {
    window.history.replaceState({}, document.title, '/settings/bundles?bundle=latest')
    return loadingComponent
  }

  if (serverError && !noAdminUser) return errorComponent

  return (
    <>
      {mainComponent}
      {tooltipComponent}
    </>
  )
}

export default App
