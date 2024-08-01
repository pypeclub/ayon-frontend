import ayonClient from '@/ayon'
import axios from 'axios'
import { ErrorBoundary } from 'react-error-boundary'
import { useEffect, useState, Suspense, lazy, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6'

// pages
import LoginPage from '@pages/LoginPage'
import ErrorPage from '@pages/ErrorPage'
import LoadingPage from '@pages/LoadingPage'
import OnBoardingPage from '@pages/OnBoarding'
const MarketPage = lazy(() => import('@pages/MarketPage'))
const InboxPage = lazy(() => import('@pages/InboxPage'))
const ProjectPage = lazy(() => import('@pages/ProjectPage'))
const ProjectManagerPage = lazy(() => import('@pages/ProjectManagerPage'))
const ExplorerPage = lazy(() => import('@pages/ExplorerPage'))
const APIDocsPage = lazy(() => import('@pages/APIDocsPage'))
const AccountPage = lazy(() => import('@pages/AccountPage'))
const SettingsPage = lazy(() => import('@pages/SettingsPage'))
const EventsPage = lazy(() => import('@pages/EventsPage'))
const ServicesPage = lazy(() => import('@pages/ServicesPage'))
const UserDashboardPage = lazy(() => import('@pages/UserDashboardPage'))
const PasswordResetPage = lazy(() => import('@pages/PasswordResetPage'))

// components
import ShareDialog from '@components/ShareDialog'
import ErrorFallback from '@components/ErrorFallback'
import { GlobalContextMenu } from '@components/GlobalContextMenu'
import Favicon from '@components/Favicon/Favicon'
import { ConfirmDialog } from 'primereact/confirmdialog'
import { toast } from 'react-toastify'

// context
import { ContextMenuProvider } from '@context/contextMenuContext'
import { ShortcutsProvider } from '@context/shortcutsContext'
import { RestartProvider } from '@context/restartContext'
import { PasteProvider, PasteModal } from '@context/pasteContext'
import { URIProvider } from '@context/uriContext'
import { NotificationsProvider } from '@context/notificationsContext'

// containers
import Header from '@containers/header'
import ProtectedRoute from '@containers/ProtectedRoute'
import FileUploadPreview from '@containers/FileUploadPreview/FileUploadPreview'
import { ViewerDialog } from '@containers/Viewer'

// state
import { login } from '@state/user'

// queries
import { useLazyGetInfoQuery } from '@queries/auth/getAuth'

// hooks
import useTooltip from '@hooks/Tooltip/useTooltip'
import WatchActivities from './containers/WatchActivities'

const App = () => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(false)
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [noAdminUser, setNoAdminUser] = useState(false)

  const storedAccessToken = localStorage.getItem('accessToken')
  if (storedAccessToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`
  }
  axios.defaults.headers.common['X-Sender'] = window.senderId

  // Call /api/info to check whether the user is logged in
  // and to acquire server settings
  const [getInfo] = useLazyGetInfoQuery()

  useEffect(() => {
    setLoading(true)

    // Get authorize_url from query params
    const urlParams = new URLSearchParams(window.location.search)
    const authorizeRedirect = urlParams.get('auth_redirect')

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

          if (authorizeRedirect) {
            const redirectUrl = `${authorizeRedirect}?access_token=${storedAccessToken}`
            window.location.href = redirectUrl
          }

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
    const body = document.body

    // attach mouseOver event listener to body element
    body.addEventListener('mouseover', handleMouse)

    // cleanup
    return () => {
      body.removeEventListener('mouseover', handleMouse)
    }
  }, [])

  const isUser = user?.data?.isUser

  // DEFINE ALL HIGH LEVEL COMPONENT PAGES HERE
  const mainComponent = useMemo(
    () => (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Favicon />
        <WatchActivities />
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
                          <ViewerDialog />
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
