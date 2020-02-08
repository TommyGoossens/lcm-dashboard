using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace Test_LifeCycleManagerDashboard.Helpers
{
    internal class FakeResponseHandler : DelegatingHandler
    {
        private readonly Dictionary<Uri, HttpResponseMessage> fakeResponses =
            new Dictionary<Uri, HttpResponseMessage>();

        private readonly Dictionary<Uri, Exception> fakeExceptions = new Dictionary<Uri, Exception>();

        public void AddFakeResponse(Uri uri, HttpResponseMessage httpResponseMessage)
        {
            fakeResponses.Add(uri, httpResponseMessage);
        }

        public void AddFakeException(Uri uri, Exception exception)
        {
            fakeExceptions.Add(uri, exception);
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,
            System.Threading.CancellationToken cancellationToken)
        {
            if (fakeResponses.ContainsKey(request.RequestUri))
            {
                return Task.FromResult(fakeResponses[request.RequestUri]);
            }
            else
            {
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.NotFound)
                    {RequestMessage = request});
            }
        }
    }
}