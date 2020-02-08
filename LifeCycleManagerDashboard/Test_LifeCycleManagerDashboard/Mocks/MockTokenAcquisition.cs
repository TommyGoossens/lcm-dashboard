using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.Identity.Client;
using Microsoft.Identity.Web;
using TokenValidatedContext = Microsoft.AspNetCore.Authentication.JwtBearer.TokenValidatedContext;

namespace Test_LifeCycleManagerDashboard.Mocks
{
    public class MockTokenAcquisition : ITokenAcquisition
    {
        public Task AddAccountToCacheFromAuthorizationCodeAsync(AuthorizationCodeReceivedContext context, IEnumerable<string> scopes)
        {
            throw new NotImplementedException();
        }

        public Task<string> GetAccessTokenOnBehalfOfUserAsync(IEnumerable<string> scopes, string tenantId = null)
        {
            return Task.FromResult(MockConstants.MockAccessToken);
        }

        public Task AddAccountToCacheFromJwtAsync(TokenValidatedContext tokenValidationContext, IEnumerable<string> scopes = null)
        {
            throw new NotImplementedException();
        }

        public Task AddAccountToCacheFromJwtAsync(Microsoft.AspNetCore.Authentication.OpenIdConnect.TokenValidatedContext tokenValidationContext, IEnumerable<string> scopes = null)
        {
            throw new NotImplementedException();
        }

        public Task RemoveAccountAsync(RedirectContext context)
        {
            throw new NotImplementedException();
        }

        public void ReplyForbiddenWithWwwAuthenticateHeader(IEnumerable<string> scopes, MsalUiRequiredException msalSeviceException)
        {
            throw new NotImplementedException();
        }
    }
}